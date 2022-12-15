import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

declare let webkitSpeechRecognition: any;

@Component({
  selector: 'speech-recognition',
  template: `<div (click)="toggleSpeechRegognition()">
              <mat-icon>{{1==1 ? 'mic' : 'mic_off'}}</mat-icon>
             </div>`
})
export class SpeechRecognitionComponent implements OnInit {
  @Input() isOn: boolean = false;
  @Output() onListen = new EventEmitter<any>();  
  
  recognition: any;
  
  constructor() { }

  async ngOnInit() {
    try{
      this.recognition = new webkitSpeechRecognition();
    }
    catch(e){
      console.log(e);
    }

    this.recognition.interimResults = true;
    this.recognition.lang = 'en-GB';

    this.recognition.addEventListener('result', async (e:any) => {      
      if(e.results[0].isFinal /*&& e.results[0][0].confidence > .8*/){
        let msg = e.results[0][0].transcript;
        await this.listen(msg);
      }
    });

  }

  toggleSpeechRegognition(){
  
    this.isOn = !this.isOn;
    if(!this.isOn){
      this.recognition.stop();
    }

    this.recognition.start();
    this.recognition.addEventListener('end',(condition:any) => {
      console.log('end', condition);
      try{ this.recognition.start(); }
      catch(e){ console.log(e); }
    });


  }

  async listen(verb: string){
    console.log(verb);
    this.onListen.emit(verb);
  }



}
