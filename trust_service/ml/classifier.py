from transformers import pipeline

class ClassifierEngine:
    def __init__(self):
        # We load this once on startup
        self.classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        self.labels = ["Helpful", "Empathetic", "Clear", "Would Listen Again", "Confusing", "Dismissive", "Reported", "Neutral"]

    def classify(self, text: str):
        # multi_label=True allows independent probabilities for each label
        result = self.classifier(
            text, 
            self.labels, 
            multi_label=True
        )
        best_label = result['labels'][0]
        confidence = result['scores'][0]
        
        # ML Confidence Threshold logic (Tuned to 0.50 for multi-label)
        if confidence < 0.50:
            return "NEUTRAL", confidence
            
        return best_label.upper().replace(" ", "_"), confidence

    def debug_classify(self, text: str):
        result = self.classifier(text, self.labels, multi_label=True)
        # Create a dictionary of label -> score
        return {label.upper().replace(" ", "_"): round(score, 4) for label, score in zip(result['labels'], result['scores'])}

classifier_engine = ClassifierEngine()
