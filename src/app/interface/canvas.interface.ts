export interface PointI {
  x: number;
  y: number;
};

export interface ColorI{
  r: number;
  g: number;
  b: number;
  a?: number;
}

export type PolyT = [number, number][];

export interface CanvasInfoI{
  averageRgb: ColorI,
  colors: [string, number][],
  colorCount: number,
  colorRange?: {min: ColorI, max: ColorI}
}

export type MethodNameT = 'giveConfusion' | 'giveMultiColor' | 'givePixelate' | 'givePixelate2' | 'giveBNW' | 'giveNegative' | 
'giveExposure' | 'givePolychromeNegative' | 'giveWhiteNoise' | 'giveParadise' | 'giveIntensity' | 'giveBloom' | 'giveOutlines' | 
'giveWater' | 'giveFluffy' | 'giveSuck' | 'giveSpotlight' | 'giveCartoonColors' | 'giveBlocks' | 'giveFrames' | 'giveRotatingFrames' |
'giveVinyl'|'giveHolyLight'|'giveBlinds'|'giveEllipse'|'giveTremolo'|'giveBrokenWall'|'giveKlimt'|'givePourPaint' | 'giveColendar' |
'giveLetters'|'giveComic'|'giveWhirlpool'|'giveBackground'|'giveShadesOf'|'giveDream'|'giveAcrylicScratch'
export type EffectT = {head: string, method: MethodNameT, tmpl?:any, noParamsMethod?: boolean, hidden?:boolean, config?:any, configProp?:any };
export type SequenceT = {name:string, effects:EffectT[]}
export type SeriesT   = {name:string, series:PatternSeriesT[]}

export type PatternSeriesT = {
  color:     string,
  path :     PolyT,
  method:    MethodNameT;
  xIncr:     number,
  yIncr:     number,
  applyMethod: boolean,
}
export type PatternT = {
  method:    MethodNameT;
  xIncr:     number,
  yIncr:     number,
  applyMethod: boolean,
  color:     string,
  append:    boolean,
  series:    PatternSeriesT[],
  seriesName: string,
  isRunning ?: boolean
}

export type SvgIconsT = 'monochrome' | 'polychrome' | 'all'

export type SvgT = {svg:string, name:string, type?:string}

export type EditorT = 'imageEffects' | 'faceCanvas';
