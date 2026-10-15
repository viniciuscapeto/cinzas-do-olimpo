param([string]$Test='harness_sub.js')
$d=$PSScriptRoot
$html=[IO.File]::ReadAllText((Join-Path $d '..\src\cinzas.html'))
$i=$html.IndexOf('<script>')+8;$j=$html.LastIndexOf('</script>')
$js=[IO.File]::ReadAllText("$d\harness_pre.js")+"`n"+$html.Substring($i,$j-$i)+"`n"+[IO.File]::ReadAllText("$d\$Test")
$out=Join-Path $env:TEMP 'cinzas_test_run.js'
[IO.File]::WriteAllText($out,$js,(New-Object Text.UTF8Encoding $false))
node $out