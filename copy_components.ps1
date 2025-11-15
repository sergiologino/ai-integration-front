$source = "E:\1_MyProjects\AltaProject (AltaTrack)\noteapp-ai-integration\frontend\src\components"
$dest = "E:\1_MyProjects\Ai-integration-front\ai-integration-front\src\components"

Copy-Item "$source\LogsViewer.tsx" -Destination $dest -Force
Copy-Item "$source\NetworkAccessManager.tsx" -Destination $dest -Force
Copy-Item "$source\NetworkAccessTests.tsx" -Destination $dest -Force

Write-Host "Files copied successfully!"

