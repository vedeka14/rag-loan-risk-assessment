import torch
import torch.nn as nn

# -------------------------
# Simple Vocabulary
# -------------------------
vocab = {
    "high": 0, "income": 1, "stable": 2, "job": 3,
    "low": 4, "debt": 5, "credit": 6, "score": 7,
    "bad": 8, "default": 9, "average": 10,
    "moderate": 11, "good": 12
}

vocab_size = len(vocab)

# -------------------------
# Convert text → numbers
# -------------------------
def tokenize(text):
    words = text.lower().split()
    return [vocab.get(word, 0) for word in words]  # unknown → 0


# -------------------------
# Model
# -------------------------
class MicroLoanModel(nn.Module):
    def __init__(self):
        super(MicroLoanModel, self).__init__()

        embed_dim = 32
        hidden_dim = 16
        output_dim = 4  # 4 risk categories

        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.fc1 = nn.Linear(embed_dim, hidden_dim)
        self.fc2 = nn.Linear(hidden_dim, output_dim)

        self.relu = nn.ReLU()

    def forward(self, x):
        x = self.embedding(x)
        x = x.mean(dim=1)
        x = self.relu(self.fc1(x))
        x = self.fc2(x)
        return x


# -------------------------
# Create model
# -------------------------
model = MicroLoanModel()

# Count parameters
total_params = sum(p.numel() for p in model.parameters())
print("Total Parameters:", total_params)


# -------------------------
# TEST WITH REAL TEXT
# -------------------------
test_inputs = [
    "high income stable job low debt",
    "low income high debt bad credit",
    "average income moderate debt",
    "default history bad credit"
]

risk_labels = ["Low Risk", "Medium Risk", "High Risk", "Reject"]

for text in test_inputs:
    tokens = tokenize(text)
    input_tensor = torch.tensor([tokens])

    output = model(input_tensor)
    predicted_class = torch.argmax(output, dim=1).item()

    print("\nInput:", text)
    print("Predicted Risk:", risk_labels[predicted_class])

