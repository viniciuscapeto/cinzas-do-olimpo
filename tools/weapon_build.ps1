param([string]$Dir="$PSScriptRoot\..\sprite-gemini\armas",[string]$Src="$PSScriptRoot\..\src\cinzas.html",[int]$Detail=2)
# armas desenhadas no Gemini -> sprites w_<arma> do jogo
# cada arquivo: uma arma só, fundo magenta. Arma de perto deitada com a ponta para a DIREITA e o cabo à esquerda
# (se vier em pé com a ponta para cima, o script gira). Arco em pé, barriga para a direita, sem corda.
Add-Type -AssemblyName System.Drawing
if(-not ('WeaponBuild2' -as [type])){
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class WeaponBuild2{
  static bool IsBg(int r,int g,int b){return r>g+45 && b>g+45 && Math.Abs(r-b)<110 && (r+b)>170;}
  // tira o fundo magenta, limpa pontos soltos e recorta no que sobrou
  public static Bitmap Key(string path){
    Bitmap src;using(var f=new Bitmap(path)){src=new Bitmap(f.Width,f.Height,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(src))g.DrawImage(f,0,0,f.Width,f.Height);}
    int W=src.Width,H=src.Height;var d=src.LockBits(new Rectangle(0,0,W,H),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[W*H*4];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int i=0;i<W*H;i++){int b=px[i*4],g=px[i*4+1],r=px[i*4+2];
      if(IsBg(r,g,b))px[i*4+3]=0;else{int m=Math.Min(r,b);if(m>g+10){int k=(m-g)*3/4;px[i*4+2]=(byte)Math.Max(0,r-k);px[i*4]=(byte)Math.Max(0,b-k);}}}
    var a=new byte[W*H];for(int i=0;i<W*H;i++)a[i]=px[i*4+3];
    for(int y=1;y<H-1;y++)for(int x=1;x<W-1;x++){int i=y*W+x;if(a[i]==0)continue;int n=0;for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++)if(a[i+dy*W+dx]>0)n++;if(n<=3)px[i*4+3]=0;}
    Marshal.Copy(px,0,d.Scan0,px.Length);src.UnlockBits(d);
    int x0=W,y0=H,x1=-1,y1=-1;for(int y=0;y<H;y++)for(int x=0;x<W;x++)if(px[(y*W+x)*4+3]>0){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    if(x1<0)throw new Exception("imagem vazia depois de tirar o fundo: "+path);
    var outb=src.Clone(new Rectangle(x0,y0,x1-x0+1,y1-y0+1),PixelFormat.Format32bppArgb);src.Dispose();return outb;
  }
  // afina a ponta: da fração `start` da largura em diante, achata na vertical (squeeze) e afunila até a ponta, depois refaz o contorno escuro
  public static Bitmap Sharpen(Bitmap s,double start,double squeeze){
    int W=s.Width,H=s.Height,hs=(int)(W*start);var d=new Bitmap(W,H,PixelFormat.Format32bppArgb);
    double sy=0;int n=0;for(int x=0;x<(int)(W*0.3);x++)for(int y=0;y<H;y++)if(s.GetPixel(x,y).A>0){sy+=y;n++;}
    double cy=n>0?sy/n:H/2.0,maxH=0;
    for(int x=hs;x<W;x++)for(int y=0;y<H;y++)if(s.GetPixel(x,y).A>0)maxH=Math.Max(maxH,Math.Abs(y-cy));
    for(int x=0;x<W;x++)for(int y=0;y<H;y++){var c=s.GetPixel(x,y);if(c.A==0)continue;
      if(x<hs){d.SetPixel(x,y,c);continue;}
      double u=(x-hs)/(double)(W-hs),ny=cy+(y-cy)*squeeze,lim=maxH*squeeze*(1-u)+1.5;
      if(Math.Abs(ny-cy)<=lim){int yy=(int)Math.Round(ny);if(yy>=0&&yy<H)d.SetPixel(x,yy,c);}}
    var o=new Bitmap(d);var dark=Color.FromArgb(255,24,20,30);
    for(int x=hs;x<W;x++)for(int y=1;y<H-1;y++){if(d.GetPixel(x,y).A>0)continue;
      for(int k=0;k<4;k++){int nx=x+(k==0?1:k==1?-1:0),ny2=y+(k==2?1:k==3?-1:0);if(nx>=0&&nx<W&&d.GetPixel(nx,ny2).A>0){for(int r=-1;r<=1;r++)if(x+r>=0&&x+r<W&&o.GetPixel(x+r,y).A==0&&r==0)o.SetPixel(x,y,dark);break;}}}
    d.Dispose();
    int x0=W,y0=H,x1=-1,y1=-1;for(int y=0;y<H;y++)for(int x=0;x<W;x++)if(o.GetPixel(x,y).A>0){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;}
    var r2=o.Clone(new Rectangle(x0,y0,x1-x0+1,y1-y0+1),PixelFormat.Format32bppArgb);o.Dispose();s.Dispose();return r2;
  }
  // reduz com média e deixa o alfa duro (cara de pixel art)
  public static Bitmap Shrink(Bitmap src,int w,int h){
    var dst=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(dst)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.CompositingMode=CompositingMode.SourceCopy;
      using(var ia=new ImageAttributes()){ia.SetWrapMode(WrapMode.TileFlipXY);g.DrawImage(src,new Rectangle(0,0,w,h),0,0,src.Width,src.Height,GraphicsUnit.Pixel,ia);}}
    var d=dst.LockBits(new Rectangle(0,0,w,h),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[d.Stride*h];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*d.Stride+x*4;int a=px[i+3];
      if(a<110){px[i]=px[i+1]=px[i+2]=px[i+3]=0;}else{if(a<255){px[i]=(byte)Math.Min(255,px[i]*255/a);px[i+1]=(byte)Math.Min(255,px[i+1]*255/a);px[i+2]=(byte)Math.Min(255,px[i+2]*255/a);}px[i+3]=255;}}
    Marshal.Copy(px,0,d.Scan0,px.Length);dst.UnlockBits(d);return dst;
  }
}
'@
}
# nome do arquivo -> id no jogo e tamanho na tela (comprimento igual ao WEAPON_GEOM.len do jogo; o arco usa a altura)
$defs=[ordered]@{espada=@('sword',26);lanca=@('spear',38);foice=@('scythe',32);martelo=@('hammer',26);pa=@('shovel',28);arco=@('bow',24);flecha=@('arrow',16)}
$datas=@();$cells=@();$prev=@()
foreach($k in $defs.Keys){
  $f=Get-ChildItem $Dir -File -ErrorAction SilentlyContinue | Where-Object { $_.BaseName -ieq $k -and $_.Extension -match '^\.(png|jpe?g|jfif|webp)$' } | Select-Object -First 1
  if(-not $f){"{0,-8} (sem arquivo, o jogo continua desenhando essa arma)" -f $k;continue}
  $id,$len=$defs[$k];$b=[WeaponBuild2]::Key($f.FullName)
  if($id -eq 'bow'){ if($b.Width -gt $b.Height*1.2){$b.RotateFlip('Rotate270FlipNone')}; $h=$len;$w=[Math]::Max(1,[int][Math]::Round($b.Width*$len/$b.Height)) }
  else{ if($b.Height -gt $b.Width*1.3){$b.RotateFlip('Rotate90FlipNone')}; if($id -eq 'spear'){$b=[WeaponBuild2]::Sharpen($b,0.6,0.5)}; $w=$len;$h=[Math]::Max(1,[int][Math]::Round($b.Height*$len/$b.Width)) }
  # guarda com $Detail vezes mais pixels: o jogo desenha no mesmo tamanho, com mais detalhe na tela nítida
  $sm=[WeaponBuild2]::Shrink($b,$w*$Detail,$h*$Detail)
  $ms=New-Object IO.MemoryStream;$sm.Save($ms,[Drawing.Imaging.ImageFormat]::Png);$b64=[Convert]::ToBase64String($ms.ToArray())
  $sm.Save((Join-Path $Dir "pronto_$k.png"),[Drawing.Imaging.ImageFormat]::Png);$prev+=,@($k,$sm)
  $datas+="  w_${id}:'data:image/png;base64,$b64'";$cells+="w_${id}:[$w,$h]"
  "{0,-8} -> w_{1}  {2}x{3} px" -f $k,$id,$w,$h;$b.Dispose()
}
$blk="// ARMAS-INICIO`r`n"
if($datas.Count){$blk+="Object.assign(SPRITE_DATA,{`r`n"+($datas -join ",`r`n")+"`r`n});`r`nObject.assign(SPRITE_CELL,{"+($cells -join ',')+"});`r`n"}
$blk+="// ARMAS-FIM"
$t=[IO.File]::ReadAllText($Src);$i=$t.IndexOf('// ARMAS-INICIO');$j=$t.IndexOf('// ARMAS-FIM')
if($i -lt 0 -or $j -lt $i){throw 'marcadores ARMAS-INICIO/ARMAS-FIM não encontrados no jogo'}
$t=$t.Substring(0,$i)+$blk+$t.Substring($j+'// ARMAS-FIM'.Length)
[IO.File]::WriteAllText($Src,$t,(New-Object Text.UTF8Encoding $false))
# prévia em 4x
if($prev.Count){$W=($prev|%{$_[1].Width*4+12}|Measure-Object -Sum).Sum+12;$H=($prev|%{$_[1].Height*4}|Measure-Object -Maximum).Maximum+40
  $pv=New-Object Drawing.Bitmap ([int]$W),([int]$H);$g=[Drawing.Graphics]::FromImage($pv);$g.Clear([Drawing.Color]::FromArgb(60,52,58));$g.InterpolationMode='NearestNeighbor';$g.PixelOffsetMode='Half'
  $x=12;foreach($p in $prev){$g.DrawImage($p[1],$x,30,$p[1].Width*4,$p[1].Height*4);$g.DrawString($p[0],(New-Object Drawing.Font('Consolas',10)),[Drawing.Brushes]::Yellow,$x,6);$x+=$p[1].Width*4+12;$p[1].Dispose()}
  $pv.Save((Join-Path $Dir '_previa.png'));$g.Dispose();$pv.Dispose()}
"{0} arma(s) no jogo. Agora rode tools\build_app.ps1 -Src src\cinzas.html -Out . para gerar o index.html" -f $datas.Count
