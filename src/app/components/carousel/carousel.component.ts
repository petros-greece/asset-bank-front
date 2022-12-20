import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  slides = [
    {img: "http://localhost/asset-bank-api/public/api/asset/1/U-1669464361-sm/png"},
    {img: "http://localhost/asset-bank-api/public/api/asset/1/U-1669464361-sm/png"},
    {img: "http://localhost/asset-bank-api/public/api/asset/1/U-1669464361-sm/png"},
  ];

  slideConfig = {
    "autoplay": 1, 
    "adaptiveHeight": 0, 
    "autoplaySpeed": 3000,
    "arrows": 1, 
    "centerMode": 1,  
    "centerPadding": '50px', 
    "cssEase": 'ease', 
    "dots": 1,
    "easing": 'linear',
    "infinite": 1,
    "initialSlide": 0,
    "mobileFirst": 0,
    "pauseOnFocus": 1,
    "slidesToShow": 1, 
    "slidesToScroll": 1,
    "speed": 300,
    // "vertical": 0, 
};
  
  addSlide() {
    this.slides.push({img: "http://localhost/asset-bank-api/public/api/asset/1/U-1669365209/jpg"})
  }
  
  removeSlide() {
    this.slides.length = this.slides.length - 1;
  }
  
  slickInit(e:any) {
    console.log('slick initialized');
  }
  
  breakpoint(e:any) {
    console.log('breakpoint');
  }
  
  afterChange(e:any) {
    console.log('afterChange');
  }
  
  beforeChange(e:any) {
    console.log('beforeChange');
  }
}
