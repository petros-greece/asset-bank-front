import { NgModule } from "@angular/core";
import { 
  ApiPathPipe, OnlyNumberPipe 
} from "./asset-bank-pipes.pipe";

const BankPipes = [
  ApiPathPipe,
  OnlyNumberPipe 
];

@NgModule({
  declarations: BankPipes,
  exports: BankPipes
})
export class BankPipesModule {}
