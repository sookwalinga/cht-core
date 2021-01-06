import functions as fn
import pandas as pd, numpy as np 
import itertools, json 


config={}
x=pd.read_excel('mappings.xlsx','variables')
config['missing_columns']=x[x.jna.str.strip()=='_'].us.replace(regex='=',value='_').values
config['us']=x.us
config['nlab_data']=fn.get_nlab_preprocessed_data()
config['jna_data']=fn.transform_jna_data()


def run(title,func,n=1):
  for x in range(n):
      df=func(config)
      df=fn.run_sample(df)
      cm=fn.confusion_matrix(y_true=df['child_death'],y_pred=df['js_result'])
      fn.plot_confusion_matrix(df,title=f'{title}{x+1}')
      print('\n\n',title.upper(),'---------')
      print(fn.get_report_summary(df))

f=['mean','median','rand']
p=['all','shehia','district'] 


for x in itertools.product(p,f):
  func = getattr(fn,'fill_missing_'+'_'.join(x))
  title=x[0]+' '+x[1]
  run(title,func,30 if x[1]=='rand' else 1)
