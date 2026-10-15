param([string]$In,[string]$Out,[int]$Rows=1,[int]$Cols=0)
# recorta uma folha do Gemini: tira fundo magenta/roxo (JPEG), apaga linhas de grade, separa cada figura por faixa de linha
Add-Type -AssemblyName System.Drawing
if(-not ('GemCut2' -as [type])){
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;using System.Collections.Generic;using System.Drawing;using System.Drawing.Imaging;using System.Runtime.InteropServices;
public static class GemCut2{
  public static bool IsBg(int r,int g,int b){return r>g+45 && b>g+45 && Math.Abs(r-b)<110 && (r+b)>170;}
  public static byte[] Key(string path,out int W,out int H){
    var src=new Bitmap(path);W=src.Width;H=src.Height;var bmp=new Bitmap(W,H,PixelFormat.Format32bppArgb);
    using(var g=Graphics.FromImage(bmp))g.DrawImage(src,0,0,W,H);src.Dispose();
    var d=bmp.LockBits(new Rectangle(0,0,W,H),ImageLockMode.ReadOnly,PixelFormat.Format32bppArgb);
    var px=new byte[W*H*4];Marshal.Copy(d.Scan0,px,0,px.Length);bmp.UnlockBits(d);bmp.Dispose();
    for(int i=0;i<W*H;i++){int b=px[i*4],gg=px[i*4+1],r=px[i*4+2];
      if(IsBg(r,gg,b))px[i*4+3]=0;
      else{int m=Math.Min(r,b);if(m>gg+10){int k=(m-gg)*3/4;px[i*4+2]=(byte)Math.Max(0,r-k);px[i*4]=(byte)Math.Max(0,b-k);}}}
    for(int y=0;y<H;y++){int dark=0;for(int x=0;x<W;x++){int i=(y*W+x)*4;if(px[i+3]>0&&px[i]+px[i+1]+px[i+2]<150)dark++;}
      if(dark>W*0.55)for(int x=0;x<W;x++)px[(y*W+x)*4+3]=0;}
    for(int x=0;x<W;x++){int dark=0;for(int y=0;y<H;y++){int i=(y*W+x)*4;if(px[i+3]>0&&px[i]+px[i+1]+px[i+2]<150)dark++;}
      if(dark>H*0.55)for(int y=0;y<H;y++)px[(y*W+x)*4+3]=0;}
    var a=new byte[W*H];for(int i=0;i<W*H;i++)a[i]=px[i*4+3];
    for(int y=1;y<H-1;y++)for(int x=1;x<W-1;x++){int i=y*W+x;if(a[i]==0)continue;int n=0;
      for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++)if(a[i+dy*W+dx]>0)n++;if(n<=2)px[i*4+3]=0;}
    return px;
  }
  // figuras dentro de um retângulo (rx0..rx1, ry0..ry1)
  public static List<int[]> Blobs(byte[] px,int W,int H,int rx0,int ry0,int rx1,int ry1,int gap,int minArea){
    var lab=new bool[W*H];var boxes=new List<int[]>();
    for(int y=ry0;y<=ry1;y++)for(int x=rx0;x<=rx1;x++){int i=y*W+x;if(lab[i]||px[i*4+3]==0)continue;
      var st=new Stack<int>();st.Push(i);lab[i]=true;int x0=x,x1=x,y0=y,y1=y,area=0;
      while(st.Count>0){int c=st.Pop();area++;int cx=c%W,cy=c/W;if(cx<x0)x0=cx;if(cx>x1)x1=cx;if(cy<y0)y0=cy;if(cy>y1)y1=cy;
        for(int dy=-1;dy<=1;dy++)for(int dx=-1;dx<=1;dx++){int nx=cx+dx,ny=cy+dy;if(nx<rx0||ny<ry0||nx>rx1||ny>ry1)continue;int n=ny*W+nx;
          if(!lab[n]&&px[n*4+3]>0){lab[n]=true;st.Push(n);}}}
      boxes.Add(new int[]{x0,y0,x1,y1,area});}
    bool merged=true;
    while(merged){merged=false;
      for(int i=0;i<boxes.Count&&!merged;i++)for(int j=i+1;j<boxes.Count&&!merged;j++){var p=boxes[i];var q=boxes[j];
        if(p[0]-gap<=q[2]&&q[0]-gap<=p[2]&&p[1]-gap<=q[3]&&q[1]-gap<=p[3]){
          boxes[i]=new int[]{Math.Min(p[0],q[0]),Math.Min(p[1],q[1]),Math.Max(p[2],q[2]),Math.Max(p[3],q[3]),p[4]+q[4]};boxes.RemoveAt(j);merged=true;}}}
    boxes.RemoveAll(b=>b[4]<minArea);boxes.Sort((p,q)=>p[0].CompareTo(q[0]));
    return boxes;
  }
  public static List<int[]> Cut(byte[] px,int W,int H,int rows,int cols){
    var all=new List<int[]>();int bh=H/rows;
    for(int r=0;r<rows;r++){int y0=r*bh,y1=Math.Min(H-1,y0+bh-1);
      if(cols>0){int cw=W/cols;for(int c=0;c<cols;c++){var b=Blobs(px,W,H,c*cw,y0,Math.Min(W-1,c*cw+cw-1),y1,4000,300);if(b.Count>0)all.Add(b[0]);}}
      else all.AddRange(Blobs(px,W,H,0,y0,W-1,y1,10,400));}
    return all;
  }
  public static void Save(byte[] px,int W,int[] b,string path){
    int w=b[2]-b[0]+1,h=b[3]-b[1]+1;var bmp=new Bitmap(w,h,PixelFormat.Format32bppArgb);
    var d=bmp.LockBits(new Rectangle(0,0,w,h),ImageLockMode.WriteOnly,PixelFormat.Format32bppArgb);
    var row=new byte[w*4];for(int y=0;y<h;y++){Array.Copy(px,((b[1]+y)*W+b[0])*4,row,0,w*4);Marshal.Copy(row,0,d.Scan0+y*d.Stride,w*4);}
    bmp.UnlockBits(d);bmp.Save(path,ImageFormat.Png);bmp.Dispose();
  }
}
'@
}
New-Item -ItemType Directory -Force $Out | Out-Null
$imgW=0;$imgH=0
$px=[GemCut2]::Key($In,[ref]$imgW,[ref]$imgH)
$boxes=[GemCut2]::Cut($px,$imgW,$imgH,$Rows,$Cols)
$k=0
foreach($b in $boxes){[GemCut2]::Save($px,$imgW,$b,(Join-Path $Out ("f{0:00}.png" -f $k)));("f{0:00} x={1} y={2} {3}x{4}" -f $k,$b[0],$b[1],($b[2]-$b[0]+1),($b[3]-$b[1]+1));$k++}
$cols2=8;$cell=140;$rowsN=[Math]::Max(1,[Math]::Ceiling($k/$cols2))
$sheet=New-Object Drawing.Bitmap ($cols2*$cell),($rowsN*$cell);$g=[Drawing.Graphics]::FromImage($sheet);$g.Clear([Drawing.Color]::FromArgb(40,40,48))
$font=New-Object Drawing.Font('Consolas',10)
for($i=0;$i -lt $k;$i++){$im=[Drawing.Image]::FromFile((Join-Path $Out ("f{0:00}.png" -f $i)));$sc=[Math]::Min(($cell-16)/$im.Width,($cell-16)/$im.Height)
  $x=($i%$cols2)*$cell;$y=[Math]::Floor($i/$cols2)*$cell;$g.DrawImage($im,$x+4,$y+14,[int]($im.Width*$sc),[int]($im.Height*$sc));$g.DrawString("$i",$font,[Drawing.Brushes]::Yellow,$x+2,$y);$im.Dispose()}
$sheet.Save((Join-Path $Out '_check.png'),[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$sheet.Dispose()
