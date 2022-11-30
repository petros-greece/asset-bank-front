import { NgModule } from "@angular/core";
import { 
  ApiPathPipe,  ApiPathSmPipe, OnlyNumberPipe 
} from "./asset-bank-pipes.pipe";

const BankPipes = [
  ApiPathPipe,
  ApiPathSmPipe,
  OnlyNumberPipe, 
];

@NgModule({
  declarations: BankPipes,
  exports: BankPipes
})
export class BankPipesModule {}
