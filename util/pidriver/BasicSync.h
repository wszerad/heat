#ifndef _BasicSync
#define _BasicSync

#include <nan.h>

NAN_METHOD(wiringPiSetupGpioSync);
NAN_METHOD(pullUpDnControlSync);
NAN_METHOD(digitalReadSync);
NAN_METHOD(digitalWriteSync);
NAN_METHOD(pinModeSync);

#endif