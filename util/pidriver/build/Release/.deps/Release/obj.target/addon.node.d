cmd_Release/obj.target/addon.node := flock ./Release/linker.lock g++ -shared -pthread -rdynamic -lwiringPi -lwiringPiDev  -Wl,-soname=addon.node -o Release/obj.target/addon.node -Wl,--start-group Release/obj.target/addon/addon.o Release/obj.target/addon/lcdAsync.o Release/obj.target/addon/lcdSync.o Release/obj.target/addon/SPIAsync.o Release/obj.target/addon/SPISync.o Release/obj.target/addon/PWMAsync.o Release/obj.target/addon/PWMSync.o Release/obj.target/addon/BasicAsync.o Release/obj.target/addon/BasicSync.o Release/obj.target/addon/specialAsync.o Release/obj.target/addon/specialSync.o -Wl,--end-group 