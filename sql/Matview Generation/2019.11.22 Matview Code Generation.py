import pandas as pd
import numpy as np

#import a file
FILE_TO_IMPORT = 'input\\2019.11.27 Death Report Matview Fields.xlsx' 
FILE_TO_EXPORT = 'output\\2019.11.27 Death Report Matview Query.xlsx'
 
#create dataframe
df = pd.read_excel(FILE_TO_IMPORT)

#create group level holder array
groups = []
sql_out = []

#loop and generate sql query code
#for treatments for different data types in the SQL - support the following:
#text
#integer
#decimal
#bool
#date
#timestamp

for i in range(0,len(df)):
    if df.loc[i,'type'] == 'begin group':
        groups.append(df.loc[i, 'name'])
    elif df.loc[i,'type'] == 'end group':
        groups.pop()
    
    group_component = ''
    for group in groups:
        group_component = group_component + group + ','

    field_name = df.loc[i,'name']
    
    #apply proper datatype treatment to field
    if df.loc[i, 'treatment'] == 'text':
        to_append = """doc #>> '{fields,""" + group_component + field_name + """}' AS """ + field_name + ','
    elif df.loc[i, 'treatment'] == 'integer':
        to_append = """NULLIF(NULLIF(doc #>> '{fields,""" + group_component + field_name + """}', 'NaN'), '')::INTEGER AS """ + field_name + ','
    elif df.loc[i, 'treatment'] == 'decimal':
        to_append = """NULLIF(NULLIF(doc #>> '{fields,""" + group_component + field_name + """}', 'NaN'), '')::DECIMAL AS """ + field_name + ','
    elif df.loc[i, 'treatment'] == 'bool':
        to_append = """NULLIF(doc #>> '{fields,""" + group_component + field_name + """}', '')::BOOLEAN AS """ + field_name + ','
    elif df.loc[i, 'treatment'] == 'date':
        to_append = """TO_DATE(NULLIF(doc #>> '{fields,""" + group_component + field_name + """}', ''), 'YYYY-MM-DD') AS """ + field_name + ','
    elif df.loc[i, 'treatment'] == 'timestamp':
        to_append = """TO_TIMESTAMP((NULLIF(doc #>> '{fields,""" + group_component + field_name + """}', '')::BIGINT / 1000)::DOUBLE PRECISION) AS """ + field_name + ','

    sql_out.append(to_append)

#append code to dataframe
df['sql_out'] = sql_out

#remove begin/end groups from output table
df = df.loc[(df.type != 'begin group') & (df.type != 'end group')]

#write output table
writer = pd.ExcelWriter(FILE_TO_EXPORT)
df.to_excel(writer, sheet_name = 'pregnancy')
writer.save()





