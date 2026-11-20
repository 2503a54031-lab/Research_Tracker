from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

assistant_bp = Blueprint("assistant", __name__)

@assistant_bp.post("/suggest")
@jwt_required()
def suggest():
    data = request.get_json(silent=True) or {}
    topic = (data.get("topic") or "").strip()
    task = data.get("task", "abstract")
    if not topic: return jsonify({"error": "Enter a research topic first."}), 400
    templates = {
      "abstract": f"研究 topic: {topic}\n\nBackground: Briefly explain the research area and the problem.\nObjective: State the specific aim of the study.\nMethod: Describe the data, tools, and method used.\nExpected/observed result: Summarize the key finding without inventing data.\nConclusion: Explain the contribution and possible future work.",
      "objectives": f"Possible objectives for a study on {topic}:\n1. Review existing work and identify a clearly defined research gap.\n2. Define measurable research questions.\n3. Select an appropriate methodology and evaluation criteria.\n4. Analyze results and document limitations.",
      "keywords": f"Build a keyword list around {topic}: core topic; main method; target application; dataset or study population; evaluation metric; domain-specific terminology."
    }
    result = templates.get(task, templates["abstract"])
    result = result.replace("研究 topic", "Research topic")
    return jsonify({"suggestion": result, "notice": "Template-based drafting aid. Verify facts and replace placeholders with your actual research and results."})
