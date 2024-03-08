import pandas as pd
from ast import literal_eval
# import json

# load boston yelp dataset
boston_data = pd.read_csv('/Users/jingqiwang/Desktop/In Progress/Cornell University/INFO 5311 visualization/hw3/yelp_boston.csv')

# def get_unique_categories(data):
#     all_categories = []
#     for categories_json in data['categories_json']:
#         try:
#             categories = literal_eval(categories_json)
#             for category in categories:
#                 all_categories.append(category[0])
#         except Exception as e:
#             print(f"Error parsing categories: {e}")
#     return set(all_categories)

# unique_categories = get_unique_categories(boston_data)
# unique_categories_df = pd.DataFrame(sorted(unique_categories), columns=['Category'])
# unique_categories_df.to_csv('/Users/jingqiwang/Desktop/In Progress/Cornell University/INFO 5311 visualization/hw3/unique_categories.csv', index=False)
# print(unique_categories)

# further categorize all labels
category_groups = {
    'Asian': ('Asian Fusion', 'Chinese', 'Cantonese', 'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Sushi Bars', 'Ramen', 'Hot Pot', 'Dim Sum', 'Mongolian'),
    'Indian': ('Indian', 'Pakistani', 'Himalayan/Nepalese', 'Bangladeshi'),
    'Middle Eastern': ('Middle Eastern', 'Turkish', 'Falafel'),
    'Mediterranean': ('Greek', 'Mediterranean'),
    'Latin American': ('Mexican', 'Latin American'),
    'American': ('American (New)', 'American (Traditional)', 'Diners', 'Gastropubs', 'Bars', 'Burgers', 'Breakfast & Brunch', 'Pubs', 'Steakhouses'),
    'European': ('Italian', 'French', 'Spanish', 'Belgian', 'Ukrainian', 'Polish', 'Armenian'),
    'Desserts/Cafes': ('Ice Cream & Frozen Yogurt', 'Cupcakes', 'Bakeries', 'Donuts', 'Desserts', 'Juice Bars & Smoothies', 'Bubble Tea', 'Breakfast & Brunch', 'Coffee & Tea', 'Cafes'),
    'Healthy': ('Vegan', 'Vegetarian', 'Salad', 'Gluten-Free', 'Halal', 'Sushi Bars', 'Live/Raw Food'),
    'Specialty Shops': ('Cheese Shops', 'Cocktail Bars', 'Delis', 'Wine Bars', 'Caterers', 'Grocery', 'Tapas/Small Plates', 'Lounges', 'Bars', 'Pubs'),
    'Fast/Casual': ('Fast Food', 'Sandwiches', 'Pizza', 'Food Trucks', 'Diners', 'Cheesesteaks', 'Food Stands'),
}

# score system for the x-y axis graph, 1-10
# 10: eastern, heavy
group_base_scores = {
    'Asian': {'x': 10, 'y': 6},
    'Indian': {'x': 8, 'y': 10},
    'Middle Eastern': {'x': 6, 'y': 10},
    'Mediterranean': {'x': 3, 'y': 8},
    'Latin American': {'x': 5, 'y': 9},
    'American': {'x': 1, 'y': 8},
    'European': {'x': 1, 'y': 7},
    'Desserts/Cafes': {'x': 5, 'y': 1},
    'Healthy': {'x': 4, 'y': 1},
    'Specialty Shops': {'x': 3, 'y': 4},
    'Fast/Casual': {'x': 4, 'y': 8},
}

# calculate x_score and y_score for each restaurant
def calculate_scores(row):
    categories = literal_eval(row['categories_json'])
    scores = {'x': [], 'y': []}

    for cat, _ in categories:
        for group, members in category_groups.items():
            if cat in members:
                scores['x'].append(group_base_scores[group]['x'])
                scores['y'].append(group_base_scores[group]['y'])

    # average score
    row['x_score'] = sum(scores['x']) / len(scores['x']) if scores['x'] else None
    row['y_score'] = sum(scores['y']) / len(scores['y']) if scores['y'] else None
    return row

boston_data = boston_data.apply(calculate_scores, axis=1)

# select fields for filtered data
final_data = boston_data[['name', 'rating', 'neighborhood', 'x_score', 'y_score']]

final_data_path = '/Users/jingqiwang/Desktop/In Progress/Cornell University/INFO 5311 visualization/hw3/filtered_data.json'
final_data.to_json(final_data_path, orient='records')