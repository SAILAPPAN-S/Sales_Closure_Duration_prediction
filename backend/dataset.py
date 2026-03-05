import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

rows = 2000

data = []

start_date = datetime(2023,1,1)

for i in range(rows):

    first_contact = start_date + timedelta(days=random.randint(0,600))
    
    proposal_delay = random.randint(1,20)
    proposal_date = first_contact + timedelta(days=proposal_delay)

    follow_up_count = random.randint(1,12)

    deal_size = random.randint(10000,100000000)

    closure_duration = random.randint(7,400)
    closure_date = first_contact + timedelta(days=closure_duration)

    follow_up_frequency = follow_up_count / closure_duration

    if closure_duration < 30:
        category = "Fast"
    elif closure_duration <= 120:
        category = "Medium"
    else:
        category = "Slow"

    data.append([
        first_contact,
        proposal_date,
        follow_up_count,
        deal_size,
        closure_date,
        proposal_delay,
        closure_duration,
        follow_up_frequency,
        category
    ])

columns = [
"first_contact_date",
"proposal_date",
"follow_up_count",
"deal_size",
"closure_date",
"proposal_delay_days",
"closure_duration_days",
"follow_up_frequency",
"closure_category"
]

df = pd.DataFrame(data, columns=columns)

df.to_csv("sales_closure_dataset.csv",index=False)

print(df.head())