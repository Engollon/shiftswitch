
#include <ESP8266WiFi.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include "Adafruit_LEDBackpack.h"
#include <ESP8266HTTPClient.h>
#include <time.h>

// ====== WiFi credentials ======
const char* ssid = "hba-47349";
const char* password = "j9vo-88ws-dm7v-xuvg";

// ====== Supabase details ======
const char* supabase_base = "https://npfkszzppijjhxihfoog.supabase.co/rest/v1";
const char* supabase_table = "button_presses";
const char* supabase_rpc = "count_today_presses";
const char* supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wZmtzenpwcGlqamh4aWhmb29nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1MzU4MDQsImV4cCI6MjA3MTExMTgwNH0.CudD1_et4gTOAFRcBHWEggx6So5XmQJrI1ajXzhdtcM";


// ====== Hardware ======
Adafruit_7segment display = Adafruit_7segment();
const int buttonPin = D5;  // GPIO14 on NodeMCU

// ====== Queue for button events ======
struct ButtonEvent {
  time_t timestamp;
};

const int MAX_EVENTS = 50;
volatile ButtonEvent eventQueue[MAX_EVENTS];
volatile int head = 0;
volatile int tail = 0;

int counter = 0;

// ====== Debounce vars ======
volatile unsigned long lastInterruptTime = 0;
const unsigned long debounceDelay = 100; // ms

// ====== Midnight reset vars ======
int lastDay = -1;

// ====== Error handling ======
int activeError = 0;               // 0 = no error
bool errorDotState = false;
unsigned long lastErrorBlink = 0;

// ====== WiFi connecting animation ======
int dotIndex = 0;
unsigned long lastDot = 0;

// ====== ISR ======
ICACHE_RAM_ATTR void handleButtonPress() {
  unsigned long now = millis();
  if (now - lastInterruptTime > debounceDelay) {
    int nextHead = (head + 1) % MAX_EVENTS;
    if (nextHead != tail) {
      eventQueue[head].timestamp = time(nullptr);
      head = nextHead;
    }
    lastInterruptTime = now;
  }
}

// ====== Display helpers ======
void showConnectingAnimation() {
  unsigned long now = millis();
  if (now - lastDot > 300) { // update every 300ms
    lastDot = now;
    display.clear();
    for (int i = 0; i < 4; i++) {
      if (i == dotIndex) {
        display.writeDigitNum(i == 2 ? 3 : i, 0, true);
      }
    }
    display.writeDisplay();
    dotIndex = (dotIndex + 1) % 4;
  }
}

void showError(int code) {
  // print error code
  display.clear();
  display.print(code);

  // blink all 4 dots
  unsigned long now = millis();
  if (now - lastErrorBlink > 500) {
    lastErrorBlink = now;
    errorDotState = !errorDotState;
  }
  for (int i = 0; i < 4; i++) {
    display.writeDigitNum(i == 2 ? 3 : i, 0, errorDotState);
  }
  display.writeDisplay();
}

// ====== Fetch today's count via RPC ======
void fetchTodayCount() {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;

    String url = String(supabase_base) + "/rpc/" + supabase_rpc;
    if (http.begin(client, url)) {
      http.addHeader("apikey", supabase_key);
      http.addHeader("Authorization", String("Bearer ") + supabase_key);
      http.addHeader("Content-Type", "application/json");

      int code = http.POST("{}");
      if (code > 0) {
        String payload = http.getString();
        payload.trim();
        int value = payload.toInt();
        if (value == 0 && payload != "0") {
          int start = payload.indexOf(':');
          int end = payload.indexOf('}');
          if (start != -1 && end != -1) {
            String numStr = payload.substring(start + 1, end);
            numStr.trim();
            value = numStr.toInt();
          }
        }
        counter = value;
        activeError = 0; // clear error if successful
        display.clear();
        display.print(counter);
        display.writeDisplay();
      } else {
        activeError = code;
      }
      http.end();
    } else {
      activeError = -1; // http.begin() failed
    }
  } else {
    activeError = -2; // WiFi not connected
  }
}

// ====== Send batch of events ======
void sendButtonBatch(const String &json) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();
    HTTPClient http;

    String url = String(supabase_base) + "/" + supabase_table;
    if (http.begin(client, url)) {
      http.addHeader("Content-Type", "application/json");
      http.addHeader("apikey", supabase_key);
      http.addHeader("Authorization", String("Bearer ") + supabase_key);
      http.addHeader("Prefer", "return=minimal");

      int code = http.POST(json);
      if (code <= 0) {
        activeError = code;
      } else {
        activeError = 0; // clear error if successful
      }
      http.end();
    } else {
      activeError = -1;
    }
  } else {
    activeError = -2;
  }
}

// ====== Setup ======
void setup() {
  Serial.begin(115200);

  display.begin(0x70);
  display.clear();
  display.writeDisplay();

  // WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    showConnectingAnimation();
    delay(50);
  }

  // Time sync
  configTime(0, 0, "pool.ntp.org", "time.nist.gov");
  while (time(nullptr) < 100000) {
    delay(500);
  }

  // Button
  pinMode(buttonPin, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(buttonPin), handleButtonPress, FALLING);

  // Initial Supabase sync
  fetchTodayCount();

  // Track current day
  time_t now = time(nullptr);
  struct tm *t = localtime(&now);
  lastDay = t->tm_mday;
}

// ====== Loop ======
void loop() {
  // Reset counter at midnight
  time_t now = time(nullptr);
  struct tm *t = localtime(&now);
  if (t->tm_mday != lastDay) {
    counter = 0;
    display.clear();
    display.print(counter);
    display.writeDisplay();
    lastDay = t->tm_mday;
  }

  // Process button events
  if (head != tail) {
    String json = "[";
    int count = 0;
    noInterrupts();
    while (tail != head && count < 10) {
      time_t ts = eventQueue[tail].timestamp;
      tail = (tail + 1) % MAX_EVENTS;
      interrupts();

      char buf[30];
      strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", gmtime(&ts));
      if (count > 0) json += ",";
      json += String("{\"type\": \"button pressed\", \"created_at\": \"") + buf + "\"}";
      count++;
      noInterrupts();
    }
    interrupts();
    json += "]";
    counter += count;

    display.clear();
    display.print(counter);
    display.writeDisplay();

    if (count > 0) {
      sendButtonBatch(json);
    }
  }

  // If error active, keep blinking it
  if (activeError != 0) {
    showError(activeError);
  }

  delay(50);
}