"use strict";

/*
 * Created with @iobroker/create-adapter v1.18.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = require("@iobroker/adapter-core");

// Load your modules here, e.g.:
// const fs = require("fs");
var net = require('net');
var matrix = null;
var query = null;
var bConnection = false;
var bWaitingForResponse = false;
var bQueryDone = false;
var bQueryInProgress=false;

var iMaxTryCounter = 0;
var iMaxTimeoutCounter = 0;
var arrCMD = [];
var lastCMD;
var in_msg = "";
var parentThis;
var cmdConnect =    new Buffer([0x5A, 0xA5, 0x14, 0x00, 0x40, 0x00, 0x00, 0x00, 0x0A, 0x5D]);

const MAXTRIES = 3;
const BIGINTERVALL = 10000;
const SMALLINTERVALL = 333;

class AudiomatrixB2008 extends utils.Adapter {

	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	constructor(options) {
		super({
			...options,
			name: "audiomatrix_b-2008",
		});
		this.on("ready", this.onReady.bind(this));
		this.on("objectChange", this.onObjectChange.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
		
		parentThis = this;
		
	}
	
	toHexString(byteArray) {
        return Array.from(byteArray, function(byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('')
    }

	initMatrix(){
        this.log.info('initMatrix().');
        this.connectMatrix();                                                  
    }

	
	
	
	pingMatrix(){
		this.log.info('AudioMatrix: pingMatrix(). TBD' );
//        arrCMD.push(cmdConnect);
//        iMaxTryCounter = 3;
//        this.processCMD();
	}
	
	queryMatrix(){
		this.log.info('AudioMatrix: queryMatrix(). TBD.  arrCMD.length vorher=' + arrCMD.length.toString());                      
//        bQueryInProgress  = true;
//		this.setState('queryState', true, true);
//        arrQuery.forEach(function(item, index, array) {                             
//            arrCMD.push(item);
//        });
//        this.log.info('AudioMatrix: queryMatrix(). arrCMD.length hinterher=' + arrCMD.length.toString());
//        iMaxTryCounter = 3;
//        this.processCMD();
	}
	
	reconnect(){
		this.log.info('AudioMatrix: reconnectMatrix(). TBD');
//        bConnection = false;
//        clearInterval(query);
//        clearTimeout(recnt);
//        matrix.destroy();

//        this.log.info('AudioMatrix: Reconnect after 15 sec...');
//        this.setState('info.connection', false, true);
        //this.setConnState(false, false);
//        recnt = setTimeout(function() {
//            parentThis.initmatrix();
//        }, 15000);
	}
	
	
	/*
		Die Untermethode zum Abbilden der Funktionen aus connect(). Es geht darum, den Code ingesamt lesbarer zu machen.
	*/
	/*
	_connect(){
		this.log.info("_connect()");
		if(!bConnection){
			if(bWaitingForResponse==false){
	            parentThis.log.info('_connect().connection==false, sending CMDCONNECT:' + parentThis.toHexString(cmdConnect));
        	    arrCMD.push(cmdConnect);
        	    iMaxTryCounter = MAXTRIES;
        	    parentThis.processCMD();
			}else{
				parentThis.log.info('_connect().bConnection==false, bWaitingForResponse==true; nichts machen. Wir warten auf Antwort.');
			}
		}else{
			parentThis.log.debug('_connect().bConnection==true. Nichts tun);
			//----Bei Marani koennten wir etwas tun, hier nicht unbedingt
		}
		
		//----Die verschiedenen Probleme rund um den Connect werden hier verarbeitet
		setTimeout(function(){ parentThis._connectionHandler }, SMALLINTERVALL);
	
	}
	*/
	
	
	/*
		Unterfunktion zur Abbildung aller Situationen, die wahrend des Connects auftreten koennen.
		Was passiert z.B., wenn die Matrix nicht reagiert, etc.
	*/
	/*
	_connectionHandler(){
		if(bWaitingForResponse==true){
			if(bQueryInProgress==false){
				if(iMaxTryCounter>0){
					//----Es kann passieren, dass man direkt NACH dem Senden eines Befehls an die Matrix und VOR der Antwort hier landet.
					//----deswegen wird erstmal der MaxTryCounter heruntergesetzt und -sofern nichts kommt- bis zum naechsten Timeout gewartet.
					//----Wenn iMaxTryCounter==0 ist, koennen wir von einem Problem ausgehen
					parentThis.log.info('_connectionHandler(): kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==' + iMaxTryCounter.toString() );
					parentThis.log.info('_connectionHandler(): kleines Timeout. lastCMD =' + parentThis.toHexString(lastCMD) + ' nichts tun, noch warten');
					iMaxTryCounter--;   
//					parentThis.setState('minorProblem', true, true);
				}else{
					if(iMaxTimeoutCounter<3){
						parentThis.log.info('_connectionHandler() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0. Erneutes Senden von ' + parentThis.toHexString(lastCMD));
						iMaxTimeoutCounter++;
						iMaxTryCounter=3;
						if(lastCMD !== undefined){
							setTimeout(function() {
								matrix.write(lastCMD);            
							}, 100);
						}
					}else{
						parentThis.log.error('_connectionHandler() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0. Erneutes Senden von ' + parentThis.toHexString(lastCMD) + 'schlug mehrfach fehl');
						iMaxTimeoutCounter=0;
						parentThis.log.error('_connectionHandler() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0');
						//parentThis.log.error('WIE reagieren wir hier drauf? Was ist, wenn ein Befehl nicht umgesetzt werden konnte?');
						bWaitingForResponse=false;
						lastCMD = '';
						in_msg = '';
						arrCMD = [];
						parentThis.reconnect();
					}
				}
			}else{
//				parentThis.setState('minorProblem', true, true);
				if(bConnection==true){
					parentThis.log.info('_connectionHandler(): kleines Timeout. bWaitingForResponse==TRUE, bQueryInProgress==TRUE, bConnection==TRUE. Abwarten. iMaxTryCounter==' + iMaxTryCounter.toString() );
				}else{
					//----Fuer den Fall, dass der Verbindungsversuch fehlschlaegt
					parentThis.log.info('_connectionHandler(): kleines Timeout. bWaitingForResponse==TRUE, bQueryInProgress==TRUE. bConnection==FALSE. iMaxTryCounter==' + iMaxTryCounter.toString() );
					bWaitingForResponse=false;
					iMaxTryCounter--;
				}
			}
		}else{
			parentThis.log.info('_connectionHandler(): bWaitingForResponse==FALSE, kein Problem');
		}
	}
	*/
	 x_connect(){
		this.log.info("_connect()");
//                if(!tabu){             //----Damit nicht gepolled wird, wenn gerade etwas anderes stattfindet.
                    if(bConnection==false){
						if(bWaitingForResponse==false){
	                        parentThis.log.info('AudioMatrix: _connect().connection==false, sending CMDCONNECT:' + parentThis.toHexString(cmdConnect));
        	                arrCMD.push(cmdConnect);
        	                iMaxTryCounter = 3;
        	                parentThis.processCMD();
						}else{
							parentThis.log.info('AudioMatrix: _connect().connection==false, bWaitingForResponse==false; nichts machen');
						}
                    }else{
                        if(bQueryDone==true){
                            if(arrCMD.length==0){
	                    	    parentThis.log.debug('AudioMatrix: _connect().connection==true, bQueryDone==TRUE, idle, pinging Matrix');
        	                	parentThis.pingMatrix();                                                                                                          
                            }else{
                                parentThis.log.debug('AudioMatrix: _connect().connection==true, bQueryDone==TRUE, arrCMD.length>0; idle, aber KEIN ping auf Matrix');
                            }
                        }else{
                            if(!bQueryInProgress){
                                parentThis.log.debug('AudioMatrix: _connect().connection==true, bQueryDone==FALSE, idle, query Matrix');                            
                                parentThis.queryMatrix();
                            }
                        }                                                                                           
                    }

                    //----Intervall fuer Befehle, Timeouts, etc
                    setTimeout(function(){
                        //parentThis.log.info('AudioMatrix: connectMatrix(): kleines Timeout');
                        if(bWaitingForResponse==true){
                            if(bQueryInProgress==false){
								if(iMaxTryCounter>0){
									//----Es kann passieren, dass man direkt NACH dem Senden eines Befehls an die Matrix und VOR der Antwort hier landet.
									//----deswegen wird erstmal der MaxTryCounter heruntergesetzt und -sofern nichts kommt- bis zum naechsten Timeout gewartet.
									//----Wenn iMaxTryCounter==0 ist, koennen wir von einem Problem ausgehen
									parentThis.log.info('AudioMatrix: _connect(): kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==' + iMaxTryCounter.toString() );
									parentThis.log.info('AudioMatrix: _connect(): kleines Timeout. lastCMD =' + parentThis.toHexString(lastCMD) + ' nichts tun, noch warten');
									iMaxTryCounter--;   
//									parentThis.setState('minorProblem', true, true);
								}else{
									if(iMaxTimeoutCounter<3){
										parentThis.log.info('AudioMatrix: _connect() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0. Erneutes Senden von ' + parentThis.toHexString(lastCMD));
										iMaxTimeoutCounter++;
										iMaxTryCounter=3;
										if(lastCMD !== undefined){
											setTimeout(function() {
												matrix.write(lastCMD);            
											}, 100);
										}
									}else{
										parentThis.log.error('AudioMatrix: _connect() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0. Erneutes Senden von ' + parentThis.toHexString(lastCMD) + 'schlug mehrfach fehl');
										iMaxTimeoutCounter=0;
										parentThis.log.error('AudioMatrix: _connect() in_msg: kleines Timeout. bWaitingForResponse==TRUE iMaxTryCounter==0');
										//parentThis.log.error('WIE reagieren wir hier drauf? Was ist, wenn ein Befehl nicht umgesetzt werden konnte?');
										bWaitingForResponse=false;
										lastCMD = '';
										in_msg = '';
										arrCMD = [];
										parentThis.reconnect();
									}
								}
                            }else{
//								parentThis.setState('minorProblem', true, true);
								if(bConnection==true){
                                    parentThis.log.info('AudioMatrix: _connect(): kleines Timeout. bWaitingForResponse==TRUE, bQueryInProgress==TRUE. Abwarten. iMaxTryCounter==' + iMaxTryCounter.toString() );
                                }else{
                                    //----Fuer den Fall, dass der Verbindungsversuch fehlschlaegt
                                    parentThis.log.info('AudioMatrix: _connect(): kleines Timeout. bWaitingForResponse==TRUE, bQueryInProgress==TRUE. Connection==FALSE. iMaxTryCounter==' + iMaxTryCounter.toString() );
				    				bWaitingForResponse=false;
                                    iMaxTryCounter--;
                                }
                            }
                        }else{
                            //parentThis.log.debug('AudioMatrix: connectMatrix() in_msg: kleines Timeout. bWaitingForResponse==FALSE, kein Problem');
                        }
                    }, SMALLINTERVALL);

//                }else{
//                    parentThis.log.debug('AudioMatrix: connectMatrix().Im Ping-Intervall aber tabu==TRUE. Nichts machen.');
//                }
            
		return;
	}
	
	/*
		Alle Befehle werden in arrCMD[] gespeichert. Die Methode arbeitet den naechsten Befehl ab.	
	*/
	processCMD(){
		if(!bWaitingForResponse){
            if(arrCMD.length>0){
                this.log.debug('processCMD: bWaitingForResponse==FALSE, arrCMD.length=' +arrCMD.length.toString());
                bWaitingForResponse=true;
                var tmp = arrCMD.shift();
                this.log.info('processCMD: next CMD=' + this.toHexString(tmp) + ' arrCMD.length rest=' +arrCMD.length.toString());
                lastCMD = tmp;
                setTimeout(function() {
                    matrix.write(tmp);           
                }, 10);
            }else{
                this.log.debug('AudioMatrix: processCMD: bWaitingForResponse==FALSE, arrCMD ist leer. Kein Problem');
            }
        }else{
            this.log.debug('AudioMatrix: processCMD: bWaitingForResponse==TRUE. Nichts machen');
        }

        //----Anzeige der Quelength auf der Oberflaeche
//        this.setStateAsync('queuelength', { val: arrCMD.length, ack: true });
	}
	
	
	_connect(){
		this.log.info("_connect()");
		if(!bConnection){			
	        parentThis.log.info('_connect().connection==false, sending CMDCONNECT:' + parentThis.toHexString(cmdConnect));
            arrCMD.push(cmdConnect);
            iMaxTryCounter = MAXTRIES;
        	parentThis.processCMD();
		}else{
			parentThis.log.debug("_connect().bConnection==true. Nichts tun");
			//----Bei Marani koennten wir etwas tun, hier nicht unbedingt
		}
		
		//----Die verschiedenen Probleme rund um den Connect werden hier verarbeitet
		setTimeout(function(){ parentThis._connectionHandler }, SMALLINTERVALL);	
	}
	
	_processIncoming(chunk){
		parentThis.log.info("_processIncoming(): " + parentThis.toHexString(chunk) );
		in_msg += parentThis.toHexString(chunk);
		
		if(bWaitingForResponse==true){                                                                          
			if((in_msg.length >= 20) && (in_msg.includes('5aa5'))){
				var iStartPos = in_msg.indexOf('5aa5');
				if(in_msg.toLowerCase().substring(iStartPos+16,iStartPos+18)=='0a'){                                                                                              
//					bWaitingForResponse = false;
					var tmpMSG = in_msg.toLowerCase().substring(iStartPos,iStartPos+20);	//Checksum
					//in_msg = '';
					in_msg = in_msg.slice(20);
					parentThis.log.info('_processIncoming(); filtered:' + tmpMSG);
//					parentThis.bWaitingForResponse = false;
//					parentThis.parseMsg(tmpMSG);
					
					lastCMD = '';
					//iMaxTryCounter = 3;
//					iMaxTimeoutCounter = 0;
//					parentThis.processCMD();                        
				}else{
					//----Irgendwie vergniesgnaddelt
					parentThis.log.info('AudioMatrix: matrix.on data: Fehlerhafte oder inkomplette Daten empfangen:' + in_msg);                                                                                                   
				}                                                                                           
			}
		}else{
			parentThis.log.info('AudioMatrix: matrix.on data(): incomming aber bWaitingForResponse==FALSE; in_msg:' + in_msg);
		}
		
		if(in_msg.length > 60){
			//----Just in case
			in_msg = '';
		}
	}
	
	connectMatrix(cb){
		this.log.info('connectMatrix():' + this.config.host + ':' + this.config.port);
		 
        bQueryDone = false;
        bQueryInProgress=false;

        matrix = new net.Socket();
        matrix.connect(this.config.port, this.config.host, function() {
            clearInterval(query);
            parentThis._connect();
            //query = setInterval(function(){parentThis._connect()}, BIGINTERVALL);

            if(cb){
                cb();
            }                             
        });

        matrix.on('data', function(chunk) {
        	//parentThis.log.info("matrix.onData(): " + parentThis.toHexString(chunk) );
        	parentThis._processIncoming(chunk);
        });

        matrix.on('timeout', function(e) {
            //if (e.code == "ENOTFOUND" || e.code == "ECONNREFUSED" || e.code == "ETIMEDOUT") {
            //            matrix.destroy();
            //}
            parentThis.log.error('AudioMatrix TIMEOUT. TBD');
            //parentThis.connection=false;
            //parentThis.setConnState(false, true);
//            parentThis.reconnect();
        });

        matrix.on('error', function(e) {
            if (e.code == "ENOTFOUND" || e.code == "ECONNREFUSED" || e.code == "ETIMEDOUT") {
                matrix.destroy();
            }
            parentThis.log.error(e);
//            parentThis.reconnect();
        });

        matrix.on('close', function(e) {
            if(bConnection){
                parentThis.log.error('AudioMatrix closed. TBD');
            }
            //parentThis.reconnect();
        });

        matrix.on('disconnect', function(e) {
            parentThis.log.error('AudioMatrix disconnected. TBD');
//            parentThis.reconnect();
        });

        matrix.on('end', function(e) {
            parentThis.log.error('AudioMatrix ended');
            //parentThis.setConnState(false, true);                                            
        });
    }

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	async onReady() {
		// Initialize your adapter here

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		//this.log.info("config option1: " + this.config.option1);
		//this.log.info("config option2: " + this.config.option2);

		this.log.info("Config Host:" + this.config.host);
		this.log.info("Config Port:" + this.config.port);
		/*
		For every state in the system there has to be also an object of type state
		Here a simple template for a boolean variable named "testVariable"
		Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
		*/
		await this.setObjectAsync("testVariable", {
			type: "state",
			common: {
				name: "testVariable",
				type: "boolean",
				role: "indicator",
				read: true,
				write: true,
			},
			native: {},
		});

		// in this template all states changes inside the adapters namespace are subscribed
		this.subscribeStates("*");

		/*
		setState examples
		you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
		*/
		// the variable testVariable is set to true as command (ack=false)
		await this.setStateAsync("testVariable", true);

		// same thing, but the value is flagged "ack"
		// ack should be always set to true if the value is received from or acknowledged from the target system
		await this.setStateAsync("testVariable", { val: true, ack: true });

		// same thing, but the state is deleted after 30s (getState will return null afterwards)
		await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });

		// examples for the checkPassword/checkGroup functions
		let result = await this.checkPasswordAsync("admin", "iobroker");
		this.log.info("check user admin pw ioboker: " + result);

		result = await this.checkGroupAsync("admin", "admin");
		this.log.info("check group user admin group admin: " + result);
		
		//----
		this.initMatrix();
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 * @param {() => void} callback
	 */
	onUnload(callback) {
		try {
			this.log.info("cleaned everything up...");
			callback();
		} catch (e) {
			callback();
		}
	}

	/**
	 * Is called if a subscribed object changes
	 * @param {string} id
	 * @param {ioBroker.Object | null | undefined} obj
	 */
	onObjectChange(id, obj) {
		if (obj) {
			// The object was changed
			this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
		} else {
			// The object was deleted
			this.log.info(`object ${id} deleted`);
		}
	}

	/**
	 * Is called if a subscribed state changes
	 * @param {string} id
	 * @param {ioBroker.State | null | undefined} state
	 */
	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.message" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

// @ts-ignore parent is a valid property on module
if (module.parent) {
	// Export the constructor in compact mode
	/**
	 * @param {Partial<ioBroker.AdapterOptions>} [options={}]
	 */
	module.exports = (options) => new AudiomatrixB2008(options);
} else {
	// otherwise start the instance directly
	new AudiomatrixB2008();
}