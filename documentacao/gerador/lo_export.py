# Executado com o Python do LibreOffice: atualiza índices e exporta DOCX + PDF.
import subprocess, sys, time, os
import uno
from com.sun.star.beans import PropertyValue

SOFFICE = r"C:\Program Files\LibreOffice\program\soffice.exe"
src, out_docx, out_pdf = sys.argv[1:4]

def prop(n, v):
    p = PropertyValue(); p.Name = n; p.Value = v; return p

proc = subprocess.Popen([SOFFICE, "--headless", "--invisible", "--norestore", "--nologo",
                         "-env:UserInstallation=file:///" + os.path.join(os.path.dirname(src), "lo_profile").replace("\\", "/"),
                         "--accept=socket,host=127.0.0.1,port=2002;urp;"])
local = uno.getComponentContext()
resolver = local.ServiceManager.createInstanceWithContext("com.sun.star.bridge.UnoUrlResolver", local)
for _ in range(60):
    try:
        ctx = resolver.resolve("uno:socket,host=127.0.0.1,port=2002;urp;StarOffice.ComponentContext"); break
    except Exception:
        time.sleep(1)
desktop = ctx.ServiceManager.createInstanceWithContext("com.sun.star.frame.Desktop", ctx)
doc = desktop.loadComponentFromURL(uno.systemPathToFileUrl(src), "_blank", 0, (prop("Hidden", True),))
print("indices:", doc.getDocumentIndexes().getCount(), "paginas:", doc.getCurrentController().getPropertyValue("PageCount"))
doc.storeToURL(uno.systemPathToFileUrl(out_docx), (prop("FilterName", "MS Word 2007 XML"),))
doc.storeToURL(uno.systemPathToFileUrl(out_pdf), (prop("FilterName", "writer_pdf_Export"),
    prop("FilterData", uno.Any("[]com.sun.star.beans.PropertyValue", tuple([prop("ExportBookmarks", True), prop("UseTaggedPDF", True), prop("Quality", 95), prop("ReduceImageResolution", False)])))))
doc.close(True)
try:
    desktop.terminate()
except Exception:
    pass
proc.wait(timeout=30)
print("ok")
