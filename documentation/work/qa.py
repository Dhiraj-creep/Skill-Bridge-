from pathlib import Path
import pypdfium2 as pdf
from PIL import Image,ImageOps,ImageDraw
from pypdf import PdfReader
root=Path('documentation/work')
for f in root.glob('*CEP_Report.pdf'):
 p=pdf.PdfDocument(str(f)); dest=root/f.stem;dest.mkdir(exist_ok=True)
 texts=[]
 for i,page in enumerate(p):
  im=page.render(scale=1.25).to_pil().convert('RGB');im.save(dest/f'page-{i+1}.png')
  txt=page.get_textpage().get_text_range();texts.append(txt)
 for offset in range(0,len(p),12):
  w,h=280,418;out=Image.new('RGB',(w*4,h*3),'#bbb');draw=ImageDraw.Draw(out)
  for idx in range(offset,min(offset+12,len(p))):
   im=Image.open(dest/f'page-{idx+1}.png');out.paste(ImageOps.contain(im,(w-8,h-24)),(((idx-offset)%4)*w,((idx-offset)//4)*h))
   draw.text((((idx-offset)%4)*w+8,((idx-offset)//4)*h+h-19),str(idx+1),fill='black')
  out.save(dest/f'contact-{offset//12+1}.png')
 (dest/'pages.txt').write_text('\n\n'.join(f'PAGE {i+1}\n{t}' for i,t in enumerate(texts)),encoding='utf8')
 print(f.name,len(p),'pages',[(i+1,len(t.strip())) for i,t in enumerate(texts) if len(t.strip())<60])
