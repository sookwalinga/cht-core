import pandas as pd, numpy as np,pickle,sys,subprocess as sp, re
from io import StringIO
import matplotlib.pyplot as plt
from sklearn.datasets import make_classification
from sklearn.metrics import confusion_matrix
from sklearn.metrics import classification_report
import itertools

with open(r"model/model.pkl", "rb") as f:
    clf = pickle.load(f)

def transform_jna_data(source_file='jna_raw_data.csv',mappings_excel='mappings.xlsx'):

    #correct shehia names, this part can be moved from here to periscope query
    jna_data=pd.read_csv(source_file)
    shehia_corretion=pd.read_excel(mappings_excel,'shehia')
    data=jna_data.merge(shehia_corretion,how='left',left_on=['district','shehia'],right_on=['district','original'])
    data.shehia=data.corrected
    data=data.drop(['corrected','original'],axis=1)

    #dummifying all columns which are dummified in the original pre_procesed_data.csv from NLAB
    dummified=['district','floor_material','delivery_location','home_electricity','water_source','highest_school_level','roof_material','shehia','status']
    for d in dummified:
        data[d]=data[d].replace(regex='^',value=d+'=')
        dummy=pd.get_dummies(data[d])
        data[dummy.columns]=dummy
        data=data.drop(d,axis=1)

    #clean data
    data['childdeath']=(data.pregnancy_outcome!='did_deliver').astype(int)
    data=data.replace({'yes':1,'no':0,'null':np.NaN})

    #put in NLAB Format
    us=pd.read_excel('mappings.xlsx','variables').us
    common_column=us.isin(data.columns)
    data[us[~common_column]]=0
    for x in data.filter(regex=' or ').columns:
        for v in x.split(' or '):
            if(v in data):
                data[x]=data[x]+data[v]   

    ## uncomment the line below if you want to save the output of the transformation to a file
    # data[us].replace(0,'').to_csv('jna_processed_with_column_missing.csv',index=False)

    #for later usage of null filling strategies
    data['shehia']=data.filter(regex='shehia=').T.idxmax().replace(regex='shehia=',value='')
    data['district']=data.filter(regex='district=').T.idxmax().replace(regex='district=',value='')
    return data


def get_nlab_preprocessed_data(nlab_samples_file='pre_procesed_data.csv'):
    pre=pd.read_csv(nlab_samples_file)
    pre['shehia']=pre.filter(regex='shehia_').T.idxmax().replace(regex='shehia_',value='')
    pre['district']=pre.filter(regex='district_').T.idxmax().replace(regex='district_',value='').replace({'Kaskazini A':'North A','Kaskazini B':'North B','Kusini':'South'})
    return pre

def fill_missing_shehia_zero(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    district_shehia=jna_data.groupby(['district','shehia']).first().reset_index()[['district','shehia']]
    x=jna_data.reset_index(drop=true)

    def randomize_shehia(r):
        m=(x.district==r.district)&(x.shehia==r.shehia)
        n=(nlab_data.district==r.district)&(nlab_data.shehia==r.shehia)
        size=len(x[m])
        if(len(nlab_data[n])>0 and size>0):
            x.loc[m,missing_columns]=0
        else:
            # x.loc[m,missing_columns]=0
            x.loc[m,'shehia_low=count']=1
    district_shehia.apply(randomize_shehia,axis=1)
    x=x[us].fillna(0)
    return x

def fill_missing_all_zero(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    x=jna_data[us].reset_index(drop=True)
    # x[missing_columns]=nlab_data[missing_columns].sample(n=len(x)).reset_index(drop=True).values
    x=x[us].fillna(0)
    return x[us]

def fill_missing_all_rand(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    x=jna_data[us].reset_index(drop=True)
    x[missing_columns]=nlab_data[missing_columns].sample(n=len(x)).reset_index(drop=True).values

    x=x[us].fillna(0)
    return x[us]

def fill_missing_district_rand(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    districts=jna_data.district.unique()
    x=jna_data.reset_index(drop=True)
    for d in districts:
        size=len(x[x.district==d])   
        x.loc[x.district==d,missing_columns]=nlab_data[nlab_data.district==d][missing_columns].sample(n=size,replace=True).reset_index(drop=True).values
    x=x[us].fillna(0)
    return x

def fill_missing_shehia_rand(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    district_shehia=jna_data.groupby(['district','shehia']).first().reset_index()[['district','shehia']]
    x=jna_data.reset_index(drop=true)

    def randomize_shehia(r):
        m=(x.district==r.district)&(x.shehia==r.shehia)
        n=(nlab_data.district==r.district)&(nlab_data.shehia==r.shehia)
        size=len(x[m])
        if(len(nlab_data[n])>0 and size>0):
            x.loc[m,missing_columns]=nlab_data[n][missing_columns].sample(n=size).reset_index(drop=true).values
        else:
            x.loc[m,missing_columns]=nlab_data[nlab_data.shehia_low_count==1][missing_columns].sample(n=size).reset_index(drop=true).values
            x.loc[m,'shehia_low=count']=1
    district_shehia.apply(randomize_shehia,axis=1)
    x=x[us].fillna(0)
    return x

def fill_missing_all_mean(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    x=jna_data[us].reset_index(drop=True)
    avg=nlab_data[missing_columns].mean().to_frame().T.values
    x.loc[:,missing_columns]=np.repeat(avg,len(x),axis=0)
    
    x=x[us].fillna(0)
    return x[us]

def fill_missing_all_median(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    x=jna_data[us].reset_index(drop=True)
    medians=nlab_data[missing_columns].median().to_frame().T.values
    x.loc[:,missing_columns]=np.repeat(medians,len(x),axis=0)
    
    x=x[us].fillna(0)
    return x[us]

def fill_missing_district_mean(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    districts=jna_data.district.unique()
    x=jna_data.reset_index(drop=True)
    for d in districts:
        size=len(x[x.district==d])   
        avg=nlab_data[nlab_data.district==d][missing_columns].mean().to_frame().T.values
        x.loc[x.district==d,missing_columns]=np.repeat(avg,size,axis=0)
    x=x[us].fillna(0)
    return x

def fill_missing_district_median(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    districts=jna_data.district.unique()
    x=jna_data.reset_index(drop=True)
    for d in districts:
        size=len(x[x.district==d])   
        median=nlab_data[nlab_data.district==d][missing_columns].median().to_frame().T.values
        x.loc[x.district==d,missing_columns]=np.repeat(median,size,axis=0)
    x=x[us].fillna(0)
    return x

def fill_missing_shehia_mean(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    district_shehia=jna_data.groupby(['district','shehia']).first().reset_index()[['district','shehia']]
    x=jna_data.reset_index(drop=True)

    def randomize_shehia(r):
        m=(x.district==r.district)&(x.shehia==r.shehia)
        n=(nlab_data.district==r.district)&(nlab_data.shehia==r.shehia)
        size=len(x[m])
        if(len(nlab_data[n])>0 and size>0):
            avg=nlab_data[n][missing_columns].mean().to_frame().T.values
            x.loc[m,missing_columns]=np.repeat(avg,size,axis=0)
        else:
            avg=nlab_data[nlab_data.shehia_low_count==1][missing_columns].mean().to_frame().T.values
            x.loc[m,missing_columns]=np.repeat(avg,size,axis=0)
            x.loc[m,'shehia_low=count']=1
    district_shehia.apply(randomize_shehia,axis=1)
    x=x[us].fillna(0)
    return x

def fill_missing_shehia_median(config):
    jna_data,nlab_data,us,missing_columns=[config[k] for k in ['jna_data','nlab_data','us','missing_columns']]
    district_shehia=jna_data.groupby(['district','shehia']).first().reset_index()[['district','shehia']]
    x=jna_data.reset_index(drop=True)

    def randomize_shehia(r):
        m=(x.district==r.district)&(x.shehia==r.shehia)
        n=(nlab_data.district==r.district)&(nlab_data.shehia==r.shehia)
        size=len(x[m])
        if(len(nlab_data[n])>0 and size>0):
            median=nlab_data[n][missing_columns].median().to_frame().T.values
            x.loc[m,missing_columns]=np.repeat(median,size,axis=0)
        else:
            median=nlab_data[nlab_data.shehia_low_count==1][missing_columns].median().to_frame().T.values
            x.loc[m,missing_columns]=np.repeat(median,size,axis=0)
            x.loc[m,'shehia_low=count']=1
    district_shehia.apply(randomize_shehia,axis=1)
    x=x[us].fillna(0)
    return x


def plot_confusion_matrix(df,model_type='js',title='Confusion matrix',cmap=plt.cm.Blues):
  plt.clf()
  cm=confusion_matrix(y_true=df['child_death'],y_pred=df['python_result'] if model_type=='python' else df['js_result'])
  plt.imshow(cm, interpolation='nearest', cmap=cmap)
  plt.title(title)
  plt.colorbar()
  classes=['False','True']
  tick_marks=np.arange(len(classes))
  plt.xticks(tick_marks,classes, rotation=45)
  plt.yticks(tick_marks, classes)

  thresh = cm.max() /2.
  for i, j  in itertools.product(range(cm.shape[0]), range(cm.shape[1])):
    plt.text(j, i, cm[i,j],
      horizontalalignment="center",
      color="white" if cm[i,j] > thresh else "black")

  plt.tight_layout()
  plt.ylabel('True Child Death')
  plt.xlabel('Predicted Child Death')
  plt.savefig('output/'+title.lower().replace(" ","_")+'.png')
  return plt

def run_js(data):
    process = sp.Popen(['node','test.js'],stdin=sp.PIPE,stdout=sp.PIPE,stderr=sp.PIPE)
    process.stdin.write(bytes(data,'utf-8'))
    stdout, stderr = process.communicate()
    return stdout.decode('utf-8').split()

def run_sample(df):
    samples=df.drop('childdeath',axis=1)
    js=StringIO()
    df.to_csv(js,index=False)
    df['js_result']=run_js(js.getvalue())
    df['js_result']=df.js_result=='True'
    df['python_result']=pd.Series(name='python_result',data=clf.predict(samples))
    df['child_death']=df.childdeath==1
    return df

def get_report_summary(df,title =''):
    return classification_report(y_pred=df.python_result,y_true=df.child_death,digits=5)
def confunsion_accuracy(cm,title=''):
    tn, fp, fn, tp=np.reshape(cm,4)
    r=tp/(tp+fp)
    p=tp/(tp+fn)
    return {
        'Title':title,
        'Accurracy':(tp+tn)/(tp+tn+fp+fn)
        ,'Recall':r
        ,'Precision':p
        ,'F1 Score':2*(r * p) / (r + p)
        }

