param([string]$Html,[string]$Js)
# troca funções inteiras do jogo pelas versões em $Js (blocos marcados com //@@nome)
$s=[IO.File]::ReadAllText($Html)
$blocks=[regex]::Split([IO.File]::ReadAllText($Js).Replace("`r`n","`n"),'(?m)^//@@')|Where-Object{$_.Trim()}
foreach($b in $blocks){
  $name=($b -split "`n")[0].Trim();$code=$b.Substring($b.IndexOf("`n")+1).TrimEnd()
  $start=$s.IndexOf("`nfunction $name(")
  if($start -lt 0){"NÃO ACHEI: $name";continue}
  $end=$s.IndexOf("`nfunction ",$start+5);$alt=$s.IndexOf("`nconst ",$start+5);if($alt -gt 0 -and $alt -lt $end){$end=$alt}
  $s=$s.Substring(0,$start+1)+$code+$s.Substring($end);"trocada: $name"
}
[IO.File]::WriteAllText($Html,$s,(New-Object Text.UTF8Encoding $false))
