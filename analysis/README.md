# IUI Analysis

This repository contains the code, data processing pipelines, and analysis scripts for our study on AI-generated future selves—a new paradigm in human-AI interaction where individuals converse with a personalized, decades-older “digital future self.”

## Overview

This repository contains the complete data analysis pipeline for the study, including:
- Pre/post survey data cleaning and processing
- Statistical comparisons (paired t-tests, ANOVA,ANCOVA,Tukey HSD)
- Interaction quality metrics analysis (UES, Realism, Trust, Persuasion)
- Correlation and regression analyses
- Visualization of results

## Getting Started

### Prerequisites

Install required Python packages:
```bash
pip install pandas numpy scipy matplotlib seaborn statsmodels
```

### Running the Analysis

1. Clone this repository
2. Ensure the `Raw_Data` folder contains all study data files (IUI_PRE.csv, IUI_POST.csv, prolific.csv, etc.)
3. Open and run `Analysis.ipynb` in Jupyter Notebook or JupyterLab

All paths are configured to work relative to the notebook location - no manual configuration needed!

## Directory Structure

```
IUI_Analysis/
├── Analysis.ipynb              # Main analysis notebook
├── Raw_Data/                   # Input data files
│   ├── IUI_PRE.csv            # Pre-intervention survey
│   ├── IUI_POST.csv           # Post-intervention survey
│   ├── prolific.csv           # Participant demographics
│   └── ...
├── intermediary/               # Generated intermediate files
│   ├── pre_survey_filtered.csv
│   ├── post_survey_filtered.csv
│   └── POST_interaction_final.csv
├── Results/                    # Analysis outputs
│   ├── pre_post_analysis.csv
│   ├── ANOVA.csv
│   ├── detailed_comparisons.csv
│   └── Graphs/                # Generated visualizations
└── README.md                   # This file
```

## Key Analyses

### Pre-Post Comparisons
Paired t-tests examining changes in:
- Affect measures (anxious, overwhelmed, relaxed, energetic, motivated)
- Adult Hope scale
- Future self-continuity (FSQ similarity, vividness, positivity)

### Between-Condition Comparisons
One-way ANOVAs with post-hoc Tukey test and baseline corrected ANCOVA comparing:
- Change scores across conditions (avatar, text, voice, control)
- Post-intervention interaction quality metrics

### Correlation Analysis
- Baseline (PRE) vs. Delta Scores (POST-PRE)
- Interaction Quality Metrics vs. Outcome changes
  
### Regression Models
Multiple regression examining the POST score predicition based on PRE and Interaction Score

## Output Files

The notebook automatically generates:
- **CSV files** in `Results/` with statistical summaries and test results
- **PNG files** in `Results/Graphs/` with visualizations
- **Intermediate data** in `intermediary/` for reproducibility


