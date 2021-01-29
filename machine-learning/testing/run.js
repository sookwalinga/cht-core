let fs=require('fs')

let file=fs.readFileSync('output.txt','utf-8')


let regx=/[A-Z\s]+ \-\-+[\s\S]+?(?=\n+[A-Z\s]+ \-\-+)/mg

while((s=regx.exec(file))){
    m=s[0].replace(/ +/g,',').split(/\n+/g)//.replace(/[a-z]+/g,'')
    m[1]=m[1].replace(/\W+/g,' ').trim().toLowerCase().replace(" ","_")
    m[2]=''
    m=m[1]+m.slice(2).map(s=>s.replace(/^[a-zA-Z,]+/g,'')).join(",")
    console.log(m)
}