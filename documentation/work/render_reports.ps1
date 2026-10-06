$reportWord = New-Object -ComObject Word.Application
$reportWord.Visible = $false
$reportWord.DisplayAlerts = 0
try {
  foreach ($reportFile in Get-ChildItem -LiteralPath 'D:\CEP website\documentation\final' -Filter '*.docx') {
    $reportDoc = $null
    try {
      $reportDoc = $reportWord.Documents.Open($reportFile.FullName, $false, $false)
      $reportDoc.Fields.Update() | Out-Null
      $reportDoc.Repaginate()
      foreach ($reportToc in $reportDoc.TablesOfContents) { $reportToc.Update() }
      foreach ($reportTof in $reportDoc.TablesOfFigures) { $reportTof.Update() }
      $reportDoc.Repaginate()
      $reportDoc.Fields.Update() | Out-Null
      $reportDoc.Save()
      $reportPdf = Join-Path 'D:\CEP website\documentation\work' ($reportFile.BaseName + '.pdf')
      $reportDoc.ExportAsFixedFormat($reportPdf,17)
      Write-Output ($reportFile.Name + ' pages=' + $reportDoc.ComputeStatistics(2))
    } finally { if ($null -ne $reportDoc) { $reportDoc.Close(0) } }
  }
} finally { $reportWord.Quit() }
