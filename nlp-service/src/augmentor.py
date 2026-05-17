import random

import pandas as pd

random.seed(42)


def augment_minority_classes(
    df: pd.DataFrame,
    target_column: str,
    target_per_class: int = 100,
    text_column: str = "text",
) -> pd.DataFrame:
    try:
        import nlpaug.augmenter.word as naw

        aug = naw.SynonymAug(aug_src="wordnet", aug_p=0.2)
    except Exception as error:
        print(f"nlpaug unavailable, skipping augmentation: {error}")
        return df

    augmented_rows = []
    class_counts = df[target_column].value_counts()

    for cls, count in class_counts.items():
        if count >= target_per_class:
            continue

        needed = target_per_class - count
        class_df = df[df[target_column] == cls]
        samples = class_df.sample(n=needed, replace=True, random_state=42)

        for _, row in samples.iterrows():
            try:
                augmented_text = aug.augment(row[text_column])[0]
                new_row = row.copy()
                new_row[text_column] = augmented_text
                augmented_rows.append(new_row)
            except Exception:
                augmented_rows.append(row)

    if augmented_rows:
        aug_df = pd.DataFrame(augmented_rows)
        result = pd.concat([df, aug_df], ignore_index=True)
        print(f"Augmented dataset: {len(df)} -> {len(result)} records")
        return result.sample(frac=1, random_state=42).reset_index(drop=True)

    return df
