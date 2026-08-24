$threshold = 80
$results = @()

$csvFiles = Get-ChildItem -Path . -Recurse -Filter "jacoco.csv"

foreach ($file in $csvFiles) {
    $module = $file.Directory.Parent.Parent.Parent.Name
    $content = Import-Csv $file.FullName

    foreach ($row in $content) {
        $package = $row.PACKAGE
        
        # Only check service and mapper packages
        if ($package -match "service|mapper") {
            $missed = [int]$row.INSTRUCTION_MISSED
            $covered = [int]$row.INSTRUCTION_COVERED
            $total = $missed + $covered
            
            if ($total -gt 0) {
                $percentage = [math]::Round(($covered / $total) * 100, 2)
                
                $results += [PSCustomObject]@{
                    Module = $module
                    Package = $package
                    Class = $row.CLASS
                    Coverage = $percentage
                    Pass = $percentage -ge $threshold
                }
            }
        }
    }
}

$results | Sort-Object Coverage | Format-Table -AutoSize
