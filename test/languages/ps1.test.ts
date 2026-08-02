import { testLanguage } from "./_harness.ts";

testLanguage(
  "ps1",
  {
    comments: `# a line comment\nGet-Date  # TODO: cache this\n$x = 1 # trailing`,
    help: `<#\n.SYNOPSIS\n    Gets a widget.\n.DESCRIPTION\n    A longer description.\n.PARAMETER Name\n    The widget name.\n.EXAMPLE\n    Get-Widget -Name box\n#>\nfunction Get-Widget { }`,
    strings: `"double quoted"\n'single quoted, $notExpanded'\n"escaped \`" quote and \`$literal"\n'it''s doubled'`,
    interpolation: `$name = "world"\nWrite-Host "Hello $name, you have $($items.Count) items"\nWrite-Host "Temp is $env:TEMP"`,
    herestrings: `$report = @"\nHost: $env:COMPUTERNAME\nTotal: $($items.Count) items\n"@\n\n$raw = @'\nNothing is $expanded here\n'@`,
    variables: `$script:count = 0\n$global:Config = @{}\n$env:PATH = "C:\\bin"\n$args.Length\n$PSVersionTable.PSVersion\n$_ -eq $PSItem\n\${odd name} = $?`,
    cmdlets: `Get-ChildItem -Path C:\\Logs -Filter *.log -Recurse |\n    Where-Object { $_.Length -gt 1MB } |\n    Sort-Object -Property LastWriteTime -Descending |\n    Select-Object -First 10 | Format-Table Name, Length`,
    splatting: `$params = @{\n    Path    = 'C:\\Logs'\n    Recurse = $true\n}\nGet-ChildItem @params 2>&1 | Out-Null`,
    functions: `function Get-Widget {\n    [CmdletBinding()]\n    param(\n        [Parameter(Mandatory)]\n        [string]$Name,\n\n        [ValidateRange(1, 10)]\n        [int]$Count = 1\n    )\n\n    begin { $total = 0 }\n    process { 1..$Count | ForEach-Object { "$Name-$_" } }\n    end { $total }\n}`,
    types: `[string]$s = [System.IO.Path]::Combine($env:TEMP, "out.txt")\n[int[]]$nums = @(1, 2, 3)\n[datetime]::Now.AddDays(-1)\n$obj -is [hashtable]`,
    "control flow": `if ($x -eq 1) {\n    Write-Output "one"\n} elseif ($x -in 2, 3) {\n    Write-Output "few"\n} else {\n    switch -Regex ($x) {\n        '^[0-9]+$' { break }\n        default { continue }\n    }\n}`,
    loops: `foreach ($file in $files) {\n    Write-Verbose $file.Name\n}\n\nfor ($i = 0; $i -lt 10; $i++) { $sum += $i }\n\nwhile ($true) { break }\n\ndo { $n-- } until ($n -le 0)`,
    "try catch": `try {\n    $data = Invoke-RestMethod -Uri $url -ErrorAction Stop\n} catch [System.Net.WebException] {\n    Write-Error "Request failed: $($_.Exception.Message)"\n    throw\n} finally {\n    Remove-Variable -Name response -ErrorAction SilentlyContinue\n}`,
    classes: `class Widget {\n    [string]$Name\n\n    Widget([string]$name) { $this.Name = $name }\n\n    [string] Describe() { return "widget " + $this.Name }\n}\n\nenum Color { Red; Green }`,
    operators: `$a -eq $b; $a -ne $b; $a -like "a*"; $a -notmatch "b"\n$x = 5 -band 3 -bor 1 -shl 2\n"{0:N2} MB" -f ($size / 1MB)\n$list -join ", " -split ","\n-not $flag -and ($p -or $q)`,
    numbers: `0 42 3.14 .5 1e-9 0xFF 1KB 2MB 10GB`,
    booleans: `$true -and $false\n$null -eq $value`,
  },
  [
    // a scoped variable expands whole inside a double quoted string, so
    // `$env:TEMP` is the variable, not `$env` followed by literal text — both
    // judges stop their in-string variable at the scope prefix
    {
      text: ":TEMP",
      judges: "str",
      shj: "other",
      why: "`$env:TEMP` interpolates whole; the judges only take `$env`",
    },
    {
      text: ":COMPUTERNAME",
      judges: "str",
      shj: "other",
      why: "`$env:COMPUTERNAME` interpolates whole; the judges only take `$env`",
    },
  ],
);
