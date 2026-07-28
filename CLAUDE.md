@AGENTS.md

# Quick Reference

## Run
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process; D:; cd "D:\0001.AI\資料庫研究obsidian\kermit-os"; npm run dev
```

## Build
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process; npm run build
```

## Key Files
- `components/canvas/Scene.tsx` — All 3D code (~1100 lines)
- `app/page.tsx` — Main page, Canvas, UI
- `data/nodeContent.ts` — Node content
- `CHANGELOG.md` — Development history
