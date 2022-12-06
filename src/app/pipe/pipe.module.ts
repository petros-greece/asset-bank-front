import { NgModule } from "@angular/core";
import { 
  ApiPathPipe,  ApiPathSmPipe, OnlyNumberPipe,
  RoundNumPipe 
} from "./asset-bank-pipes.pipe";

const BankPipes = [
  ApiPathPipe,
  ApiPathSmPipe,
  OnlyNumberPipe, 
  RoundNumPipe
];

@NgModule({
  declarations: BankPipes,
  exports: BankPipes
})
export class BankPipesModule {}
