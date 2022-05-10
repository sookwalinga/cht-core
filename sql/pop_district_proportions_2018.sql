DROP TABLE IF EXISTS pop_district_proportions_2018;
CREATE TABLE IF NOT EXISTS pop_district_proportions_2018 AS
WITH pop_district_proportions_2018_CTE AS (
    SELECT * FROM 
    (VALUES 
        ('North A',0.078341031),
        ('North B',0.062220503),
        ('South',0.029313561),
        ('Central',0.055357189),
        ('West A',0.120091224),
        ('West B',0.154964177),
        ('Urban',0.1685256),
        ('Micheweni',0.084868237),
        ('Chake Chake',0.079597481),
        ('Mkoani',0.079677868),
        ('Wete',0.087043129)) AS t(district,proportion) 
)

SELECT * FROM pop_district_proportions_2018_CTE;