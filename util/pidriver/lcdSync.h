#ifndef _lcdSync
#define _lcdSync

#include <nan.h>

NAN_METHOD(lcdInitSync);
NAN_METHOD(lcdClearSync);
NAN_METHOD(lcdHomeSync);
NAN_METHOD(lcdPositionSync);
NAN_METHOD(lcdPutsSync);

#endif