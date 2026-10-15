param([string]$Root,[string]$OutJs,[string]$Preview)
# monta as folhas do jogo a partir dos recortes do Gemini: reduz, alinha pelos pés, gera base64
Add-Type -AssemblyName System.Drawing
if(-not ('GemBuild' -as [type])){
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Drawing;using System.Drawing.Drawing2D;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class GemBuild{
  // reduz com média e depois deixa o alfa duro (cara de pixel art)
  public static Bitmap Shrink(Bitmap src,double s,int cut){
    int w=Math.Max(1,(int)Math.Round(src.Width*s)),h=Math.Max(1,(int)Math.Round(src.Height*s));
    var dst=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(dst)){g.InterpolationMode=InterpolationMode.HighQualityBicubic;g.PixelOffsetMode=PixelOffsetMode.HighQuality;g.CompositingMode=CompositingMode.SourceCopy;
      using(var ia=new ImageAttributes()){ia.SetWrapMode(WrapMode.TileFlipXY);g.DrawImage(src,new Rectangle(0,0,w,h),0,0,src.Width,src.Height,GraphicsUnit.Pixel,ia);}}
    var d=dst.LockBits(new Rectangle(0,0,w,h),ImageLockMode.ReadWrite,PixelFormat.Format32bppArgb);var px=new byte[d.Stride*h];Marshal.Copy(d.Scan0,px,0,px.Length);
    for(int y=0;y<h;y++)for(int x=0;x<w;x++){int i=y*d.Stride+x*4;int a=px[i+3];
      if(a<cut){px[i]=px[i+1]=px[i+2]=px[i+3]=0;}else{if(a<255){px[i]=(byte)Math.Min(255,px[i]*255/a);px[i+1]=(byte)Math.Min(255,px[i+1]*255/a);px[i+2]=(byte)Math.Min(255,px[i+2]*255/a);}px[i+3]=255;}}
    Marshal.Copy(px,0,d.Scan0,px.Length);dst.UnlockBits(d);return dst;
  }
  // x médio dos pixels opacos nos 15% de baixo (onde ficam os pés)
  public static double FootX(Bitmap b){
    var d=b.LockBits(new Rectangle(0,0,b.Width,b.Height),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);var px=new byte[d.Stride*b.Height];Marshal.Copy(d.Scan0,px,0,px.Length);b.UnlockBits(d);
    double sx=0;int n=0;int y0=(int)(b.Height*0.85);
    for(int y=y0;y<b.Height;y++)for(int x=0;x<b.Width;x++)if(px[y*d.Stride+x*4+3]>0){sx+=x;n++;}
    return n>0?sx/n:b.Width/2.0;
  }
}
'@
}
$defs=@(
 # nome, pasta, quadros, medida (h=altura / w=largura), alvo, quadro de referência (ou 'norm' = cada quadro na mesma altura), modo âncora (foot/center)
 @('gDamiao','cut5','0,1','h',34,'norm','foot'),
 @('gCleia','cut5','2,3','h',33,'norm','foot'),
 @('gLino','cut5','4,5','h',25,'norm','foot'),
 @('gOdete','cut5','6,7','h',34,'norm','foot'),
 @('gPetros','cut5','8,9','h',33,'0','foot'),
 @('gBras','cut5','10,11','h',35,'norm','foot'),
 @('gGuard','cut5','12,13,14,15','h',36,'0','foot'),
 @('gClock','cut7','0,1,2','h',78,'0','foot'),
 @('gLucio','cut7','3,4,5,6','h',62,'0','foot'),
 @('gHeart','cut7','7,8','w',46,'0','center'),
 @('gWeaver','cut6','0,1,2,3,4,5,6','w',96,'0','foot'),
 @('gSpiderling','cut6','7','w',22,'0','foot'),
 @('gCocoon','cut6','8','h',28,'0','foot'),
 @('gTitan','cut2','1,2,3,4,5','h',86,'1','foot'),
 @('gWraith','cut2','7','w',44,'0','center'),
 @('gGarg','cut1','0,1,2,3,4,5,6,7','h',32,'0','center'),
 @('gCult','cut1','16,17,18,19,20,21,22,23','h',34,'0','foot'),
 @('gShadow','cut1','24,25,26,27,29,30,31','w',34,'0','foot'),
 @('gZomb','cut4','7,8,10,11,12,13,14','h',32,'5','foot'),
 @('gBrute','cut4','0,2,3,4,5,6','h',52,'0','foot'),
 @('gChest','cut3','11,14','w',18,'0','foot'),
 @('gFire','cut3','4,6','h',30,'0','foot'),
 @('gMace','cut3','0','w',18,'0','center'),
 @('gSpirit','cut2','6','h',64,'0','foot'),
 @('gTornado','cut2','8','h',84,'0','foot'),
 @('gStatue','cut3','4,6','h',72,'0','foot'),
 @('gColumn','cut3','7,8,9,10','h',62,'0','foot')
)
$js=New-Object Text.StringBuilder
[void]$js.Append("// Sprites desenhados no Gemini pelo jogador (pasta sprite-gemini), recortados e reduzidos`n")
$cells=@();$anchors=@();$datas=@();$previews=@()
foreach($e in $defs){
  $name,$dir,$fr,$dim,$tgt,$ref,$mode=$e
  $ids=$fr.Split(',')|%{[int]$_}
  $srcs=$ids|%{[Drawing.Bitmap]::FromFile((Join-Path $Root ("$dir\f{0:00}.png" -f $_)))}
  if($ref -ne 'norm'){$r=$srcs[[int]$ref];$base=if($dim -eq 'h'){$r.Height}else{$r.Width};$s=$tgt/$base}
  $fr2=@();foreach($b in $srcs){$sc=if($ref -eq 'norm'){$tgt/$b.Height}else{$s};$sm=[GemBuild]::Shrink($b,$sc,110);$fx=if($mode -eq 'foot'){[GemBuild]::FootX($sm)}else{$sm.Width/2};$fr2+=,@($sm,$fx)}
  $L=0;$R=0;$Hh=0;foreach($f in $fr2){$L=[Math]::Max($L,[Math]::Ceiling($f[1]));$R=[Math]::Max($R,[Math]::Ceiling($f[0].Width-$f[1]));$Hh=[Math]::Max($Hh,$f[0].Height)}
  $cw=[int]($L+$R+2);$ch=[int]$Hh;$ax=[int]($L+1)
  $sheet=New-Object Drawing.Bitmap ($cw*$fr2.Count),$ch;$g=[Drawing.Graphics]::FromImage($sheet);$g.InterpolationMode='NearestNeighbor'
  for($i=0;$i -lt $fr2.Count;$i++){$f=$fr2[$i];$x=$i*$cw+$ax-[Math]::Round($f[1]);$y=$ch-$f[0].Height;$g.DrawImageUnscaled($f[0],[int]$x,[int]$y)}
  $g.Dispose()
  $ms=New-Object IO.MemoryStream;$sheet.Save($ms,[Drawing.Imaging.ImageFormat]::Png);$b64=[Convert]::ToBase64String($ms.ToArray())
  $sheet.Save((Join-Path $Root "built_$name.png"),[Drawing.Imaging.ImageFormat]::Png);$previews+=$name
  # âncora: pés no fundo da célula (centro para quem voa)
  $ay=if($mode -eq 'center'){[int]($ch/2)}else{$ch}
  $datas+="  ${name}:'data:image/png;base64,$b64'";$cells+="${name}:[$cw,$ch]";$anchors+="${name}:[$ax,$ay]"
  "{0,-12} {1} quadros  célula {2}x{3}  ({4} KB)" -f $name,$fr2.Count,$cw,$ch,[int]($b64.Length/1024)
  $sheet.Dispose();$srcs|%{$_.Dispose()}
}
# retratos 48x48 (grade da folha g8 com linhas de alturas diferentes)
$rows=@(@(0,268),@(276,557),@(563,895));$pn=@('mira','tiresias','hefesto','caronte','damiao','cleia','lino','odete','petros','bras','andros','teo')
Add-Type -AssemblyName System.Drawing
$src=[Drawing.Bitmap]::FromFile((Join-Path (Split-Path $Root) 'gemini\g8.jpg'))
$ports=@()
for($i=0;$i -lt 12;$i++){$c=$i%4;$r=[Math]::Floor($i/4);$y0=$rows[$r][0];$hh=$rows[$r][1]-$y0;$x0=$c*256
  $side=[Math]::Min(250,$hh);$cx=$x0+3;$cy=$y0+[Math]::Max(0,($hh-$side)/2)
  $bmp=New-Object Drawing.Bitmap 48,48;$g=[Drawing.Graphics]::FromImage($bmp);$g.InterpolationMode='HighQualityBicubic';$g.PixelOffsetMode='HighQuality'
  $g.DrawImage($src,(New-Object Drawing.Rectangle 0,0,48,48),(New-Object Drawing.Rectangle $cx,$cy,$side,$side),[Drawing.GraphicsUnit]::Pixel);$g.Dispose()
  # fundo magenta vira escuro
  for($y=0;$y -lt 48;$y++){for($x=0;$x -lt 48;$x++){$p=$bmp.GetPixel($x,$y);if($p.R -gt $p.G+45 -and $p.B -gt $p.G+45 -and [Math]::Abs($p.R-$p.B) -lt 110 -and ($p.R+$p.B) -gt 170){$bmp.SetPixel($x,$y,[Drawing.Color]::FromArgb(255,26,18,22))}}}
  $ms=New-Object IO.MemoryStream;$bmp.Save($ms,[Drawing.Imaging.ImageFormat]::Png);$ports+="  $($pn[$i]):'data:image/png;base64,$([Convert]::ToBase64String($ms.ToArray()))'"
  $bmp.Save((Join-Path $Root "port_$($pn[$i]).png"),[Drawing.Imaging.ImageFormat]::Png);$bmp.Dispose()}
$src.Dispose()
# logo do título
$lg=[Drawing.Bitmap]::FromFile((Join-Path $Root 'cut2\f00.png'));$sm=[GemBuild]::Shrink($lg,300/$lg.Width,90);$ms=New-Object IO.MemoryStream;$sm.Save($ms,[Drawing.Imaging.ImageFormat]::Png);$logo=[Convert]::ToBase64String($ms.ToArray());$sm.Save((Join-Path $Root 'built_logo.png'));$lg.Dispose()
[void]$js.Append("Object.assign(SPRITE_DATA,{`n"+($datas -join ",`n")+"`n});`n")
[void]$js.Append("Object.assign(SPRITE_CELL,{"+($cells -join ',')+"});`n")
[void]$js.Append("Object.assign(SPRITE_ANCHOR,{"+($anchors -join ',')+"});`n")
[void]$js.Append("const PORTRAITS={`n"+($ports -join ",`n")+"`n};`n")
[void]$js.Append("const LOGO='data:image/png;base64,$logo';`n")
[IO.File]::WriteAllText($OutJs,$js.ToString(),(New-Object Text.UTF8Encoding $false))
"JS total: {0} KB" -f [int]((Get-Item $OutJs).Length/1024)
# prévia: todas as folhas em 3x
$names=$previews;$y=0;$maxW=0;$hs=@()
foreach($n in $names){$im=[Drawing.Image]::FromFile((Join-Path $Root "built_$n.png"));$maxW=[Math]::Max($maxW,$im.Width*3);$hs+=$im.Height*3+6;$im.Dispose()}
$pv=New-Object Drawing.Bitmap ([int]$maxW+10),([int](($hs|Measure-Object -Sum).Sum)+10);$g=[Drawing.Graphics]::FromImage($pv);$g.Clear([Drawing.Color]::FromArgb(60,52,58));$g.InterpolationMode='NearestNeighbor';$g.PixelOffsetMode='Half'
$y=4;foreach($n in $names){$im=[Drawing.Image]::FromFile((Join-Path $Root "built_$n.png"));$g.DrawImage($im,4,$y,$im.Width*3,$im.Height*3);$y+=$im.Height*3+6;$im.Dispose()}
$pv.Save($Preview,[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$pv.Dispose()
