param([string]$Dir="$PSScriptRoot\..\sprite-gemini\teo",[string]$Src="$PSScriptRoot\..\src\cinzas.html",[int]$Detail=2,[string]$Preview="")
# sprites da evolução do Teo (Gemini) -> folhas t<fase><Anim> do jogo
# cada imagem é uma grade 4x2 (quadros 0-7, da esquerda para a direita, linha de cima e depois a de baixo)
# o mapa abaixo diz de qual imagem/quadro sai cada pose; 'agachar' = gera o agachado espremendo o quadro parado
Add-Type -AssemblyName System.Drawing
if(-not ('TeoBuild' -as [type])){
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Collections.Generic;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class TeoBuild{
  static bool IsBg(int r,int g,int b){return r>g+45 && b>g+45 && Math.Abs(r-b)<110 && (r+b)>170;}
  // um quadro da grade: tira o magenta, fica com a figura maior e os pedaços soltos que não encostam na borda
  public static Bitmap Cell(string path,int c,int r){
    Bitmap src;int W,H;
    using(var f=new Bitmap(path)){int cw=f.Width/4,ch=f.Height/2;W=cw;H=ch;src=new Bitmap(W,H,PixelFormat.Format32bppArgb);
      using(var g=Graphics.FromImage(src))g.DrawImage(f,new Rectangle(0,0,W,H),new Rectangle(c*cw,r*ch,cw,ch),GraphicsUnit.Pixel);}
    var d=src.LockBits(new Rectangle(0,0,W,H),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[W*H*4];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int i=0;i<W*H;i++){int b=px[i*4],g=px[i*4+1],rr=px[i*4+2];
      if(IsBg(rr,g,b)||(rr+g+b<60&&false))px[i*4+3]=0;else{int m=Math.Min(rr,b);if(m>g+10){int k=(m-g)*3/4;px[i*4+2]=(byte)Math.Max(0,rr-k);px[i*4]=(byte)Math.Max(0,b-k);}}}
    // linhas da grade: faixas finas escuras coladas na borda do quadro
    for(int y=0;y<H;y++)for(int x=0;x<W;x++){if(x>3&&y>3&&x<W-4&&y<H-4)continue;int i=(y*W+x)*4;if(px[i]+px[i+1]+px[i+2]<150)px[i+3]=0;}
    var lab=new int[W*H];int nl=0;var area=new List<int>();var touch=new List<bool>();
    for(int i=0;i<W*H;i++){if(px[i*4+3]==0||lab[i]!=0)continue;nl++;int a=0;bool t=false;var st=new Stack<int>();st.Push(i);lab[i]=nl;
      while(st.Count>0){int cc=st.Pop();a++;int cx=cc%W,cy=cc/W;if(cx<3||cy<3||cx>W-4||cy>H-4)t=true;
        for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;int n=ny*W+nx;if(lab[n]==0&&px[n*4+3]!=0){lab[n]=nl;st.Push(n);}}}
      area.Add(a);touch.Add(t);}
    int best=0;for(int k=1;k<nl;k++)if(area[k]>area[best])best=k;
    var keep=new bool[nl+1];for(int k=0;k<nl;k++)keep[k+1]=k==best||(!touch[k]&&area[k]>=40);
    int x0=W,y0=H,x1=-1,y1=-1;
    for(int i=0;i<W*H;i++){if(!keep[lab[i]]){px[i*4+3]=0;continue;}if(px[i*4+3]==0)continue;int x=i%W,y=i/W;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    Marshal.Copy(px,0,d.Scan0,px.Length);src.UnlockBits(d);
    if(x1<0)throw new Exception("quadro vazio: "+path+" "+c+","+r);
    var o=src.Clone(new Rectangle(x0,y0,x1-x0+1,y1-y0+1),PixelFormat.Format32bppArgb);src.Dispose();return o;
  }
  // agachado gerado: tronco desce, pernas encolhem (joelhos dobrados)
  public static Bitmap Squash(Bitmap s){
    int W=s.Width,H=s.Height,cut=(int)(H*0.58),legs=H-cut,nl=(int)(legs*0.42),nh=cut+nl;
    var o=new Bitmap(W+4,nh,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(o)){g.InterpolationMode=InterpolationMode.NearestNeighbor;g.PixelOffsetMode=PixelOffsetMode.Half;
      g.DrawImage(s,new Rectangle(2,0,W,cut),new Rectangle(0,0,W,cut),GraphicsUnit.Pixel);
      g.DrawImage(s,new Rectangle(0,cut,W+4,nl),new Rectangle(0,cut,W,legs),GraphicsUnit.Pixel);}
    return o;
  }
  public static Bitmap Shrink(Bitmap src,int w,int h){
    var dst=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(dst)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.CompositingMode=CompositingMode.SourceCopy;
      using(var ia=new ImageAttributes()){ia.SetWrapMode(WrapMode.TileFlipXY);g.DrawImage(src,new Rectangle(0,0,w,h),0,0,src.Width,src.Height,GraphicsUnit.Pixel,ia);}}
    var d=dst.LockBits(new Rectangle(0,0,w,h),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[d.Stride*h];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*d.Stride+x*4;int a=px[i+3];
      if(a<110){px[i]=px[i+1]=px[i+2]=px[i+3]=0;}else{if(a<255){px[i]=(byte)Math.Min(255,px[i]*255/a);px[i+1]=(byte)Math.Min(255,px[i+1]*255/a);px[i+2]=(byte)Math.Min(255,px[i+2]*255/a);}px[i+3]=255;}}
    Marshal.Copy(px,0,d.Scan0,px.Length);dst.UnlockBits(d);return dst;
  }
  // x médio dos pixels nos 12% de baixo (os pés)
  public static double FootX(Bitmap b){double s=0;int n=0;int y0=(int)(b.Height*0.88);for(int y=y0;y<b.Height;y++)for(int x=0;x<b.Width;x++)if(b.GetPixel(x,y).A>0){s+=x;n++;}return n>0?s/n:b.Width/2.0;}
  // mão: o pixel mais à direita numa faixa de altura (ou o mais alto, para os braços erguidos)
  public static int[] Hand(Bitmap b,double v0,double v1,bool top){
    int H=b.Height,W=b.Width;
    if(top){for(int y=0;y<H;y++)for(int x=W-1;x>=0;x--)if(b.GetPixel(x,y).A>0)return new int[]{x,y};}
    int ya=(int)(H*v0),yb=(int)(H*v1);for(int x=W-1;x>=0;x--)for(int y=ya;y<=yb&&y<H;y++)if(b.GetPixel(x,y).A>0)return new int[]{x,y};
    return new int[]{W/2,H/2};
  }
  // centro do punho: média dos pixels numa janelinha logo atrás da ponta achada por Hand (abaixo dela, nos braços erguidos)
  public static double[] Fist(Bitmap b,int[] hd,bool top){
    int xa=top?hd[0]-2:hd[0]-3,xb=top?hd[0]+2:hd[0],ya=top?hd[1]:hd[1]-2,yb=hd[1]+4;double sx=0,sy=0;int n=0;
    for(int y=ya;y<=yb;y++)for(int x=xa;x<=xb;x++){if(x<0||y<0||x>=b.Width||y>=b.Height)continue;if(b.GetPixel(x,y).A>0){sx+=x;sy+=y;n++;}}
    return n>0?new double[]{Math.Round(sx/n,1),Math.Round(sy/n,1)}:new double[]{hd[0],hd[1]};
  }
}
'@
}
# fase -> imagem A (parado/corrida/pulo/morto) e quadros; mesma ordem em todas: [arquivo, quadro 0-7]
$MAP=@{
 0=@{idle=@('IMG_5988',0);idle2=@('IMG_5988',1);run=@(@('IMG_5988',2),@('IMG_5988',3),@('IMG_5988',4),@('IMG_5988',5));jump=@('IMG_5988',6);fall=@('IMG_5988',7);
     atk=@(@('IMG_5989',0),@('IMG_5989',1),@('IMG_5989',2),@('IMG_5989',3));hurt=@('IMG_5989',4);crouch=@(@('IMG_5989',5),@('IMG_5989',6));dead=@('IMG_5989',7)};
 1=@{idle=@('IMG_5986',0);idle2=@('IMG_5986',1);run=@(@('IMG_5986',2),@('IMG_5986',3),@('IMG_5986',4),@('IMG_5986',5));jump=@('IMG_5986',6);fall=@('IMG_5986',6);
     atk=@(@('IMG_5987',0),@('IMG_5987',1),@('IMG_5987',2),@('IMG_5987',3));hurt=@('IMG_5986',6);crouch='agachar';dead=@('IMG_5986',7)};
 2=@{idle=@('IMG_5993',0);idle2=@('IMG_5993',1);run=@(@('IMG_5993',2),@('IMG_5993',3),@('IMG_5993',4),@('IMG_5993',5));jump=@('IMG_5993',6);fall=@('IMG_5993',6);
     atk=@(@('IMG_5992',4),@('IMG_5992',4),@('IMG_5992',5),@('IMG_5993',5));hurt=@('IMG_5993',6);crouch=@(@('IMG_5992',7),@('IMG_5992',7));dead=@('IMG_5993',7)};
 3=@{idle=@('IMG_5994',0);idle2=@('IMG_5994',1);run=@(@('IMG_5994',2),@('IMG_5994',3),@('IMG_5994',4),@('IMG_5994',5));jump=@('IMG_5994',6);fall=@('IMG_5994',6);
     atk=@(@('IMG_5995',0),@('IMG_5995',1),@('IMG_5995',2),@('IMG_5995',3));hurt=@('IMG_5994',6);crouch=@(@('IMG_5995',5),@('IMG_5995',5));dead=@('IMG_5994',7)};
 4=@{idle=@('IMG_5996',0);idle2=@('IMG_5996',1);run=@(@('IMG_5996',2),@('IMG_5996',3),@('IMG_5996',4),@('IMG_5996',5));jump=@('IMG_5996',6);fall=@('IMG_5996',6);
     atk=@(@('IMG_5997',0),@('IMG_5997',1),@('IMG_5997',2),@('IMG_5997',3));hurt=@('IMG_5997',4);crouch=@(@('IMG_5997',5),@('IMG_5997',5));dead=@('IMG_5997',6)}
}
$HEIGHT=31;$CELL=44*$Detail;$AX=23*$Detail;$AY=38*$Detail
function Load($ref){$f=(Get-ChildItem $Dir -File|Where-Object{$_.BaseName -ieq $ref[0]}|Select-Object -First 1).FullName;if(-not $f){throw "falta $($ref[0])"};return [TeoBuild]::Cell($f,$ref[1]%4,[Math]::Floor($ref[1]/4))}
# anim -> lista de [quadro, regra da mão (faixa de altura ou 'top'), ângulo da arma em descanso]
$datas=@();$cells=@();$anch=@();$hands=@();$dets=@();$prev=@()
foreach($stg in 0..4){
  $m=$MAP[$stg];$ref=Load $m.idle;$scale=$HEIGHT*$Detail/$ref.Height;$ref.Dispose()
  $anims=[ordered]@{
    Idle=@(@($m.idle,.38,.62,0,.46),@($m.idle2,.38,.62,0,.46),@($m.idle,.38,.62,0,.46),@($m.idle2,.38,.62,0,.46));
    Run=@($m.run|%{,@($_,.28,.55,0,.52)});
    Atk=@(@($m.atk[0],0,0,1,-2.4),@($m.atk[1],0,.35,0,-1),@($m.atk[2],.18,.5,0,.1),@($m.atk[3],.4,.75,0,.6));
    Jump=@(@($m.hurt,.25,.55,0,.5),@($m.jump,.25,.55,0,.5),@($m.jump,.25,.55,0,.5),@($m.fall,.25,.55,0,.5),@($m.idle,.38,.62,0,.46));
    Crouch=@(@(0,.35,.75,0,.46),@(1,.35,.75,0,.46));
    Dead=@(,@($m.dead,0,0,0,0))
  }
  foreach($an in $anims.Keys){
    $fr=$anims[$an];$sheet=New-Object Drawing.Bitmap ($CELL*$fr.Count),$CELL;$g=[Drawing.Graphics]::FromImage($sheet);$g.InterpolationMode='NearestNeighbor';$hl=@()
    for($i=0;$i -lt $fr.Count;$i++){
      $e=$fr[$i]
      if($an -eq 'Crouch'){ if($m.crouch -eq 'agachar'){$b0=Load $m.idle;$b=[TeoBuild]::Squash($b0);$b0.Dispose()}else{$b=Load $m.crouch[$e[0]]} }else{$b=Load $e[0]}
      $w=[Math]::Max(1,[int][Math]::Round($b.Width*$scale));$h=[Math]::Max(1,[int][Math]::Round($b.Height*$scale))
      $sm=[TeoBuild]::Shrink($b,$w,$h);$b.Dispose()
      $fx=if($an -eq 'Dead'){$sm.Width/2}else{[TeoBuild]::FootX($sm)}
      $px=[int]($i*$CELL+$AX-[Math]::Round($fx));$py=[int]($AY-$sm.Height)
      $g.DrawImageUnscaled($sm,$px,$py)
      # a arma é presa no centro do punho desenhado, e a própria mão do quadro é redesenhada por cima do cabo no jogo
      $hd=[TeoBuild]::Hand($sm,$e[1],$e[2],[bool]$e[3]);$fc=[TeoBuild]::Fist($sm,$hd,[bool]$e[3]);$hx=$px-$i*$CELL+$fc[0];$hy=$py+$fc[1]
      $hl+="[$hx,$hy,$($e[4])]";$sm.Dispose()
    }
    $g.Dispose();$key="t$stg$an"
    $ms=New-Object IO.MemoryStream;$sheet.Save($ms,[Drawing.Imaging.ImageFormat]::Png);$datas+="  ${key}:'data:image/png;base64,"+[Convert]::ToBase64String($ms.ToArray())+"'"
    $cells+="${key}:[$CELL,$CELL]";$anch+="${key}:[$AX,$AY]";$dets+="${key}:$Detail";$hands+="${key}:[$($hl -join ',')]"
    $prev+=,@($key,$sheet)
  }
}
$blk="// TEO-INICIO`r`n// a evolução do Teo desenhada no Gemini: t<fase><animação>, guardadas com $Detail vezes mais pixels`r`nObject.assign(SPRITE_DATA,{`r`n"+($datas -join ",`r`n")+"`r`n});`r`nObject.assign(SPRITE_CELL,{"+($cells -join ',')+"});`r`nObject.assign(SPRITE_ANCHOR,{"+($anch -join ',')+"});`r`nconst TEO_DETAIL={"+($dets -join ',')+"};`r`nconst TEO_HAND={"+($hands -join ',')+"};`r`n// TEO-FIM"
$t=[IO.File]::ReadAllText($Src);$i=$t.IndexOf('// TEO-INICIO');$j=$t.IndexOf('// TEO-FIM')
if($i -lt 0 -or $j -lt $i){throw 'marcadores TEO-INICIO/TEO-FIM não encontrados no jogo'}
$t=$t.Substring(0,$i)+$blk+$t.Substring($j+'// TEO-FIM'.Length)
[IO.File]::WriteAllText($Src,$t,(New-Object Text.UTF8Encoding $false))
"{0} folhas no jogo ({1} KB)" -f $datas.Count,[int](($datas -join '').Length/1024)
if($Preview){
  $Wp=($prev|%{$_[1].Width}|Measure-Object -Maximum).Maximum;$pv=New-Object Drawing.Bitmap ([int]$Wp*2),([int]($prev.Count*$CELL*2));$g=[Drawing.Graphics]::FromImage($pv);$g.Clear([Drawing.Color]::FromArgb(70,90,70));$g.InterpolationMode='NearestNeighbor';$g.PixelOffsetMode='Half'
  $y=0;foreach($p in $prev){$g.DrawImage($p[1],0,$y,$p[1].Width*2,$p[1].Height*2);$g.DrawString($p[0],(New-Object Drawing.Font('Consolas',10)),[Drawing.Brushes]::Yellow,2,$y);$y+=$CELL*2;$p[1].Dispose()}
  $pv.Save($Preview);$g.Dispose();$pv.Dispose()}
