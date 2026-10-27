param([string]$Dir="$PSScriptRoot\..\sprite-gemini\armas",[string]$Src="$PSScriptRoot\..\src\cinzas.html",[int]$Detail=2)
# ícones e itens do Gemini -> sprites i_<nome> do jogo
# itens.jfif: folha 4x2 com linhas pretas (adaga, poção, botas, manopla / escudo, cinzas, moedas, adaga roxa)
# investida.jfif: uma figura só (as botas com o rastro)
Add-Type -AssemblyName System.Drawing
if(-not ('ItemBuild' -as [type])){
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Collections.Generic;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class ItemBuild{
  static bool IsBg(int r,int g,int b){return r>g+45 && b>g+45 && Math.Abs(r-b)<110 && (r+b)>170;}
  // recorta o retângulo, tira o magenta e fica com a maior figura (ou com todas que não encostam na borda)
  public static Bitmap Cut(string path,Rectangle rc,bool all){
    Bitmap src;using(var f=new Bitmap(path)){src=new Bitmap(rc.Width,rc.Height,PixelFormat.Format32bppArgb);using(var g=Graphics.FromImage(src))g.DrawImage(f,new Rectangle(0,0,rc.Width,rc.Height),rc,GraphicsUnit.Pixel);}
    int W=src.Width,H=src.Height;var d=src.LockBits(new Rectangle(0,0,W,H),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[W*H*4];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int i=0;i<W*H;i++){int b=px[i*4],g=px[i*4+1],r=px[i*4+2];if(IsBg(r,g,b))px[i*4+3]=0;else{int m=Math.Min(r,b);if(m>g+10){int k=(m-g)*3/4;px[i*4+2]=(byte)Math.Max(0,r-k);px[i*4]=(byte)Math.Max(0,b-k);}}}
    // figuras ligadas
    var lab=new int[W*H];int nl=0;var area=new List<int>();var touch=new List<bool>();var box=new List<int[]>();
    for(int i=0;i<W*H;i++){if(px[i*4+3]==0||lab[i]!=0)continue;nl++;int a=0;bool t=false;int x0=W,y0=H,x1=0,y1=0;var st=new Stack<int>();st.Push(i);lab[i]=nl;
      while(st.Count>0){int c=st.Pop();a++;int cx=c%W,cy=c/W;if(cx<2||cy<2||cx>W-3||cy>H-3)t=true;if(cx<x0)x0=cx;if(cx>x1)x1=cx;if(cy<y0)y0=cy;if(cy>y1)y1=cy;
        for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;int n=ny*W+nx;if(lab[n]==0&&px[n*4+3]!=0){lab[n]=nl;st.Push(n);}}}
      area.Add(a);touch.Add(t);box.Add(new int[]{x0,y0,x1,y1});}
    int best=-1;for(int k=0;k<nl;k++)if(!touch[k]&&(best<0||area[k]>area[best]))best=k;
    var keep=new bool[nl+1];int bx0=W,by0=H,bx1=0,by1=0;
    for(int k=0;k<nl;k++){bool ok=all?(!touch[k]&&area[k]>=40):(k==best);if(!ok)continue;keep[k+1]=true;var bb=box[k];bx0=Math.Min(bx0,bb[0]);by0=Math.Min(by0,bb[1]);bx1=Math.Max(bx1,bb[2]);by1=Math.Max(by1,bb[3]);}
    for(int i=0;i<W*H;i++)if(!keep[lab[i]])px[i*4+3]=0;
    Marshal.Copy(px,0,d.Scan0,px.Length);src.UnlockBits(d);
    if(bx1<bx0)throw new Exception("nada encontrado em "+rc);
    var o=src.Clone(new Rectangle(bx0,by0,bx1-bx0+1,by1-by0+1),PixelFormat.Format32bppArgb);src.Dispose();return o;
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
}
'@
}
# nome, arquivo, coluna, linha (folha 4x2; -1 = imagem inteira), medida (w/h), tamanho na tela, todas as figuras?
$defs=@(
 @('i_dagger','itens',0,0,'w',11,$false),@('i_flask','itens',1,0,'h',8,$false),@('i_boots','itens',2,0,'w',16,$false),@('i_gauntlet','itens',3,0,'w',13,$false),
 @('i_shield','itens',0,1,'h',10,$false),@('i_ash','itens',1,1,'w',9,$false),@('i_coins','itens',2,1,'w',9,$false),
 @('i_dash','investida',-1,-1,'w',22,$true))
$datas=@();$prev=@()
foreach($e in $defs){
  $name,$file,$c,$r,$dim,$size,$all=$e
  $path=(Get-ChildItem $Dir -File | Where-Object { $_.BaseName -ieq $file } | Select-Object -First 1).FullName
  if(-not $path){"$name (sem $file)";continue}
  $im=[Drawing.Image]::FromFile($path);$IW=$im.Width;$IH=$im.Height;$im.Dispose()
  if($c -ge 0){$cw=[int]($IW/4);$chh=[int](($IH-40)/2);$rc=New-Object Drawing.Rectangle ($c*$cw),($r*$chh),$cw,$chh}else{$rc=New-Object Drawing.Rectangle 0,0,$IW,($IH-30)}
  $b=[ItemBuild]::Cut($path,$rc,$all)
  if($dim -eq 'w'){$w=$size;$h=[Math]::Max(1,[int][Math]::Round($b.Height*$size/$b.Width))}else{$h=$size;$w=[Math]::Max(1,[int][Math]::Round($b.Width*$size/$b.Height))}
  $sm=[ItemBuild]::Shrink($b,$w*$Detail,$h*$Detail);$b.Dispose()
  $ms=New-Object IO.MemoryStream;$sm.Save($ms,[Drawing.Imaging.ImageFormat]::Png)
  $datas+="  ${name}:'data:image/png;base64,"+[Convert]::ToBase64String($ms.ToArray())+"'";$prev+=,@($name,$sm)
  "{0,-10} {1}x{2} px" -f $name,$w,$h
}
$blk="// ITENS-INICIO`r`n"+$(if($datas.Count){"Object.assign(SPRITE_DATA,{`r`n"+($datas -join ",`r`n")+"`r`n});`r`n"}else{''})+"// ITENS-FIM"
$t=[IO.File]::ReadAllText($Src);$i=$t.IndexOf('// ITENS-INICIO');$j=$t.IndexOf('// ITENS-FIM')
if($i -lt 0 -or $j -lt $i){throw 'marcadores ITENS-INICIO/ITENS-FIM não encontrados no jogo'}
$t=$t.Substring(0,$i)+$blk+$t.Substring($j+'// ITENS-FIM'.Length)
[IO.File]::WriteAllText($Src,$t,(New-Object Text.UTF8Encoding $false))
# prévia em 4x
$W=($prev|%{$_[1].Width*2+12}|Measure-Object -Sum).Sum+12;$H=($prev|%{$_[1].Height*2}|Measure-Object -Maximum).Maximum+30
$pv=New-Object Drawing.Bitmap ([int]$W),([int]$H);$g=[Drawing.Graphics]::FromImage($pv);$g.Clear([Drawing.Color]::FromArgb(60,52,58));$g.InterpolationMode='NearestNeighbor';$g.PixelOffsetMode='Half'
$x=12;foreach($p in $prev){$g.DrawImage($p[1],$x,24,$p[1].Width*2,$p[1].Height*2);$g.DrawString($p[0].Substring(2),(New-Object Drawing.Font('Consolas',8)),[Drawing.Brushes]::Yellow,$x,4);$x+=$p[1].Width*2+12;$p[1].Dispose()}
$pv.Save((Join-Path $Dir '_previa_itens.png'));$g.Dispose();$pv.Dispose()
"{0} itens no jogo" -f $datas.Count
