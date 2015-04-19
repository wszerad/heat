#include <node.h>
#include <nan.h>
#include <wiringPi.h>
#include <mcp23s17.h>
#include <string.h>
#include <errno.h>

using v8::String;
using v8::Number;

NAN_METHOD(mcp23s17SetupSync) {
  	NanScope();

	if ( args.Length() != 3  || !args[0]->IsInt32() || !args[1]->IsInt32() || !args[2]->IsInt32() ) {
		NanThrowError("Bad parameter");
		NanReturnValue(NanUndefined());
	}

	int pinBase = args[0]->Int32Value();
	int spiPort = args[1]->Int32Value();
	int devId = args[2]->Int32Value();
	int ret = mcp23s17Setup(pinBase, spiPort, devId);
	
	if(ret==-1) {
		NanThrowError(NanNew<String>(strerror(errno)));
	}
	NanReturnValue(NanNew<Number>(ret));
}