import { Component,ElementRef, OnInit, Renderer2, ViewChild, ViewChildren, QueryList } from '@angular/core';
import { PredictionEvent } from '../prediction-event';
@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  gesture: String = "";

  @ViewChild('player', { static: true }) playerElement: ElementRef;
  playerLeft:number = 50;
  playerBottom:number = 50;
  @ViewChild('circle', { static: true }) circleElement: ElementRef;
  @ViewChild('danger1', { static: true }) danger1Element: ElementRef;
  @ViewChild('danger2', { static: true }) danger2Element: ElementRef;
  @ViewChild('danger3', { static: true }) danger3Element: ElementRef;
  @ViewChild('danger4', { static: true }) danger4Element: ElementRef;
  @ViewChild('danger5', { static: true }) danger5Element: ElementRef;
  dangerElements: ElementRef[] = [];
  score:number = 0;
  scores:number[]=[];
  showRecords=false;
  //stop the game
  isStopped: boolean=false;
  //game is over
  isOver= false;
  constructor(private renderer: Renderer2, private el: ElementRef, ){}
  ngOnInit() {
    this.createRandomCircle();
    this.dangerElements.push(this.danger1Element,this.danger2Element,
      this.danger3Element,this.danger4Element,this.danger5Element);
    this.createDanger();
    this.score=0;
  }
  prediction(event: PredictionEvent){
    this.gesture = event.getPrediction();
    if(!this.isStopped && !this.isOver) this.playerMovement(event);
    if(this.isStopped || this.isOver) {
      if(event.getPrediction()=="Hand Pointing") {
        if(this.isStopped==true) {
          this.isStopped=false;
        }
        if(this.isOver==true){
          this.isOver=false;
          this.ngOnInit();
        }
      }
      //TODO: add two custom getures and uncomment
      //else if(event.getPrediction()=="") this.openRecord();
      //else if(event.getPrediction()=="") this.closeRecord();
    }
  }
  //When a prediction event occurs, the playerMovement method is called
  playerMovement(event: PredictionEvent){
    //must make use of at least five of the common gestures
    if(event.getPrediction()=="Two Open Hands") this.moveUp();
    else if(event.getPrediction()=="Two Closed Hands") this.moveDown();
    else if(event.getPrediction()=="Open Hand") this.moveRight();
    else if(event.getPrediction()=="Closed Hand") this.moveLeft();
    else if(event.getPrediction()=="Two Hands Pointing") this.isStopped=true;
    this.checkCollision();
  }
  //View or close records
  openRecord(){
    if(this.showRecords==false)this.showRecords=true;
  }
  closeRecord(){
    if(this.showRecords==true)this.showRecords=false;
  }
  
  checkCollision(){
    //check whether the player touches the circle
    const playerRect = this.playerElement.nativeElement.getBoundingClientRect();
    const circleRect = this.circleElement.nativeElement.getBoundingClientRect();
    if(playerRect.left < circleRect.right&&
      playerRect.right > circleRect.left&&
      playerRect.top < circleRect.bottom&&
      playerRect.bottom > circleRect.top){
        //move circle
        this.createRandomCircle();
        //update score
        this.updateScore();
      }
  //check whether the player touches the dangerous item
    this.dangerElements.forEach((dangerElement) => {
      if(playerRect.left < dangerElement.nativeElement.getBoundingClientRect().right&&
        playerRect.right > dangerElement.nativeElement.getBoundingClientRect().left&&
        playerRect.top < dangerElement.nativeElement.getBoundingClientRect().bottom&&
        playerRect.bottom > dangerElement.nativeElement.getBoundingClientRect().top){
          this.isOver=true;
          this.scores.push(this.score);
        }
      });
    //avoid player going over the border
    const containerWidth = this.el.nativeElement.querySelector('.game-container').clientWidth;
    const containerHeight = this.el.nativeElement.querySelector('.game-container').clientHeight;
    if(playerRect.left<0){
      this.moveRight();
    }
    if(playerRect.right>containerWidth-3){
      this.moveLeft();
    }
    if(playerRect.top<5){
      this.moveDown();
    }
    if(playerRect.bottom>containerHeight+5){
      this.moveUp();
    }
  }
  //player movement
  moveLeft() {
    this.playerLeft -= 5;
    this.renderer.setStyle(this.playerElement.nativeElement, 'left', `${this.playerLeft}%`);
  }
  moveRight() {
    this.playerLeft += 5;
    this.renderer.setStyle(this.playerElement.nativeElement, 'left', `${this.playerLeft}%`);
  }
  moveDown() {
    this.playerBottom -= 5;
    this.renderer.setStyle(this.playerElement.nativeElement, 'bottom', `${this.playerBottom}%`);
  }
  moveUp() {
    this.playerBottom += 5;
    this.renderer.setStyle(this.playerElement.nativeElement, 'bottom', `${this.playerBottom}%`);
  }

  createDanger(){
    this.dangerElements.forEach((dangerElement) => {
      const randomPosition = this.getRandomPosition();
      this.renderer.setStyle(dangerElement.nativeElement, 'left', `${randomPosition.left}px`);
      this.renderer.setStyle(dangerElement.nativeElement, 'bttom', `${randomPosition.bottom}px`);
      this.renderer.setStyle(dangerElement.nativeElement, 'top', `${randomPosition.top}px`);
      const gameContainer = this.el.nativeElement.querySelector('.game-container');
      this.renderer.appendChild(gameContainer, dangerElement.nativeElement);
    });
  }
  //actually this just move a exist circle to a new location
  createRandomCircle() {
    const randomPosition = this.getRandomPosition();
    this.renderer.setStyle(this.circleElement.nativeElement, 'left', `${randomPosition.left}px`);
    this.renderer.setStyle(this.circleElement.nativeElement, 'bottom', `${randomPosition.bottom}px`);
    this.renderer.setStyle(this.circleElement.nativeElement, 'top', `${randomPosition.top}px`);
    const gameContainer = this.el.nativeElement.querySelector('.game-container');
    this.renderer.appendChild(gameContainer, this.circleElement.nativeElement);
  }
  private getRandomPosition() {
    const containerWidth = this.el.nativeElement.querySelector('.game-container').clientWidth;
    const containerHeight = this.el.nativeElement.querySelector('.game-container').clientHeight;
    const randomLeft = Math.floor(Math.random() * (containerWidth - 50)); // Adjust 50 based on the circle size
    const randomBottom = Math.floor(Math.random() * (containerHeight - 50)); 
    const avoidTop = Math.floor(Math.random() * (containerHeight - 80)); 
    return { left: randomLeft, bottom: randomBottom, top:avoidTop };
  }
  updateScore() {
    this.score+=10;
  }
  

}
