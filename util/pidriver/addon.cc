#include <nan.h>
#include "lcdAsync.h"
#include "lcdSync.h"
#include "SPIAsync.h"
#include "SPISync.h"
#include "PWMAsync.h"
#include "PWMSync.h"
#include "BasicAsync.h"
#include "BasicSync.h"
#include "specialAsync.h"
#include "specialSync.h"

using v8::FunctionTemplate;
using v8::Handle;
using v8::Object;
using v8::String;

void InitAll(Handle<Object> exports) {
	//LCD
	exports->Set(NanNew<String>("lcdInitAsync"),
		NanNew<FunctionTemplate>(lcdInitAsync)->GetFunction());
	exports->Set(NanNew<String>("lcdHomeAsync"),
		NanNew<FunctionTemplate>(lcdHomeAsync)->GetFunction());
	exports->Set(NanNew<String>("lcdClearAsync"),
		NanNew<FunctionTemplate>(lcdClearAsync)->GetFunction());
	exports->Set(NanNew<String>("lcdPositionAsync"),
		NanNew<FunctionTemplate>(lcdPositionAsync)->GetFunction());
	exports->Set(NanNew<String>("lcdPutsAsync"),
		NanNew<FunctionTemplate>(lcdPutsAsync)->GetFunction());
	exports->Set(NanNew<String>("lcdInitSync"),
		NanNew<FunctionTemplate>(lcdInitSync)->GetFunction());
	exports->Set(NanNew<String>("lcdHomeSync"),
		NanNew<FunctionTemplate>(lcdHomeSync)->GetFunction());
	exports->Set(NanNew<String>("lcdClearSync"),
		NanNew<FunctionTemplate>(lcdClearSync)->GetFunction());
	exports->Set(NanNew<String>("lcdPositionSync"),
		NanNew<FunctionTemplate>(lcdPositionSync)->GetFunction());
	exports->Set(NanNew<String>("lcdPutsSync"),
		NanNew<FunctionTemplate>(lcdPutsSync)->GetFunction());
		
	//SPI
	exports->Set(NanNew<String>("wiringPiSPISetupAsync"),
		NanNew<FunctionTemplate>(wiringPiSPISetupAsync)->GetFunction());
	exports->Set(NanNew<String>("wiringPiSPIDataRWAsync"),
		NanNew<FunctionTemplate>(wiringPiSPIDataRWAsync)->GetFunction());
	exports->Set(NanNew<String>("wiringPiSPISetupSync"),
		NanNew<FunctionTemplate>(wiringPiSPISetupSync)->GetFunction());
	exports->Set(NanNew<String>("wiringPiSPIDataRWSync"),
		NanNew<FunctionTemplate>(wiringPiSPIDataRWSync)->GetFunction());
		
	//Basic
	exports->Set(NanNew<String>("wiringPiSetupGpioAsync"),
		NanNew<FunctionTemplate>(wiringPiSetupGpioAsync)->GetFunction());
	exports->Set(NanNew<String>("pullUpDnControlAsync"),
		NanNew<FunctionTemplate>(pullUpDnControlAsync)->GetFunction());
	exports->Set(NanNew<String>("digitalWriteAsync"),
		NanNew<FunctionTemplate>(digitalWriteAsync)->GetFunction());
	exports->Set(NanNew<String>("digitalReadAsync"),
		NanNew<FunctionTemplate>(digitalReadAsync)->GetFunction());
	exports->Set(NanNew<String>("wiringPiSetupGpioSync"),
		NanNew<FunctionTemplate>(wiringPiSetupGpioSync)->GetFunction());	
	exports->Set(NanNew<String>("pullUpDnControlSync"),
		NanNew<FunctionTemplate>(pullUpDnControlSync)->GetFunction());
	exports->Set(NanNew<String>("digitalWriteSync"),
		NanNew<FunctionTemplate>(digitalWriteSync)->GetFunction());
	exports->Set(NanNew<String>("digitalReadSync"),
		NanNew<FunctionTemplate>(digitalReadSync)->GetFunction());
	exports->Set(NanNew<String>("pinModeAsync"),
		NanNew<FunctionTemplate>(pinModeAsync)->GetFunction());
	exports->Set(NanNew<String>("pinModeSync"),
		NanNew<FunctionTemplate>(pinModeSync)->GetFunction());
	
	//PWM
	exports->Set(NanNew<String>("pwmWriteAsync"),
		NanNew<FunctionTemplate>(pwmWriteAsync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetModeAsync"),
		NanNew<FunctionTemplate>(pwmSetModeAsync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetRangeAsync"),
		NanNew<FunctionTemplate>(pwmSetRangeAsync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetClockAsync"),
		NanNew<FunctionTemplate>(pwmSetClockAsync)->GetFunction());
	exports->Set(NanNew<String>("pwmWriteSync"),
		NanNew<FunctionTemplate>(pwmWriteSync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetModeSync"),
		NanNew<FunctionTemplate>(pwmSetModeSync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetRangeSync"),
		NanNew<FunctionTemplate>(pwmSetRangeSync)->GetFunction());
	exports->Set(NanNew<String>("pwmSetClockSync"),
		NanNew<FunctionTemplate>(pwmSetClockSync)->GetFunction());
		
	//Special
	exports->Set(NanNew<String>("mcp23s17SetupAsync"),
		NanNew<FunctionTemplate>(mcp23s17SetupAsync)->GetFunction());
	exports->Set(NanNew<String>("mcp23s17SetupSync"),
		NanNew<FunctionTemplate>(mcp23s17SetupSync)->GetFunction());
}

NODE_MODULE(addon, InitAll)