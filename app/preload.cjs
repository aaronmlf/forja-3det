const {contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('desktop',{load:()=>ipcRenderer.invoke('load'),save:d=>ipcRenderer.invoke('save',d),export:(data,name)=>ipcRenderer.invoke('export',{data,name}),import:()=>ipcRenderer.invoke('import'),pdf:html=>ipcRenderer.invoke('pdf',html),source:(file,page)=>ipcRenderer.invoke('source',{file,page})});
