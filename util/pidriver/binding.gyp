{
	"targets": [{
		"target_name": "addon",
		"sources": [
      "addon.cc",
			"lcdAsync.cc",
			"lcdSync.cc",
			"SPIAsync.cc",
			"SPISync.cc",
			"PWMAsync.cc",
			"PWMSync.cc",
			"BasicAsync.cc",
			"BasicSync.cc",
			"specialAsync.cc",
			"specialSync.cc"
		],
		"include_dirs": [ "/usr/local/include", "<!(node -e \"require('nan')\")" ],
		"ldflags": [ "-lwiringPi", "-lwiringPiDev"]
    }]
}