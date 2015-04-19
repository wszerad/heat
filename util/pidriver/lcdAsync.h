#ifndef _lcdAsync
#define _lcdAsync

#include <nan.h>

NAN_METHOD(lcdInitAsync);
NAN_METHOD(lcdClearAsync);
NAN_METHOD(lcdHomeAsync);
NAN_METHOD(lcdPositionAsync);
NAN_METHOD(lcdPutsAsync);

#endif