import cv2, numpy as np, json, sys
src=sys.argv[1]
im=cv2.imread(src); g=cv2.cvtColor(im,cv2.COLOR_BGR2GRAY)
S=4
def trace(mask_fn, box, eps=0.6):
    x0,y0,x1,y1=box
    sub=im[y0:y1,x0:x1]
    big=cv2.resize(sub,None,fx=S,fy=S,interpolation=cv2.INTER_CUBIC)
    m=(mask_fn(big)).astype(np.uint8)*255
    m=cv2.GaussianBlur(m,(0,0),1.2); m=(m>127).astype(np.uint8)*255
    cs,h=cv2.findContours(m,cv2.RETR_CCOMP,cv2.CHAIN_APPROX_NONE)
    d=[]
    for c in cs:
        if cv2.contourArea(c)<60: continue
        a=cv2.approxPolyDP(c,eps*S/2,True)[:,0,:]/S
        d.append('M'+' '.join(f'{x+x0:.1f} {y+y0:.1f}' for x,y in a)+'Z')
    return ''.join(d)
# monogram: white inside navy disc
white=lambda b:(b.min(axis=2)>200)
mono=trace(white,(120,600,480,900))
# wordmark navy
navy=lambda b:((b[:,:,2]<110)&(b[:,:,0]>70)&(b[:,:,1]<120))
word=trace(navy,(530,650,1450,880))
print(json.dumps({'mono':mono,'word':word}))
