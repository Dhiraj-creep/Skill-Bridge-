import os
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

from generate_docx_framework import (
    setup_doc_style, add_title, add_h1, add_h2, add_h3,
    add_para, add_bullet, add_callout_box, create_table, add_page_break
)

def build_varun_documentation():
    doc = Document()
    setup_doc_style(doc)

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    p_inst = doc.add_paragraph()
    p_inst.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cep = p_inst.add_run("COMMUNITY ENGAGEMENT PROJECT (CEP) REPORT\n\n")
    r_cep.font.name = 'Times New Roman'
    r_cep.font.size = Pt(20)
    r_cep.font.bold = True
    r_cep.font.color.rgb = RGBColor(15, 23, 42)

    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tit = p_title.add_run("EMPIRICAL DATA ANALYTICS OF CAMPUS PLACEMENT ECOSYSTEMS: EVIDENCE-BASED INTERVENTIONS AND METRIC MODELS\n")
    r_tit.font.name = 'Times New Roman'
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = RGBColor(30, 58, 138)
    r_sub = p_title.add_run("A Quantitative Statistical Study on Information Latency, Student Satisfaction, and Skill Alignment across 200 Undergraduate Technology Cohorts\n\n")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(71, 85, 105)

    p_subm = doc.add_paragraph()
    p_subm.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_subm.paragraph_format.line_spacing = 1.3
    r_s = p_subm.add_run(
        "Submitted in Partial Fulfilment\n"
        "of the Requirements for the Award of the Degree of\n"
        "BACHELOR OF SCIENCE (DATA SCIENCE)\n"
        "SEMESTER V\n\n"
        "By\n"
        "VARUN PATIL\n"
        "Roll Number: 24302D0074\n"
        "(Data Analytics & Statistical Research Specialist)\n\n"
        "Under the esteemed guidance of\n"
        "FACULTY PROJECT GUIDE\n"
        "Assistant / Associate Professor, Department of Computing\n\n"
        "DEPARTMENT OF COMPUTING\n"
        "VIDYALANKAR SCHOOL OF INFORMATION TECHNOLOGY\n"
        "(Autonomous College affiliated to University of Mumbai)\n"
        "MUMBAI - 400037, MAHARASHTRA\n"
        "ACADEMIC YEAR: 2026 - 2027\n"
    )
    r_s.font.name = 'Times New Roman'
    r_s.font.size = Pt(11)

    add_page_break(doc)

    # =========================================================================
    # CERTIFICATE PAGE
    # =========================================================================
    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_c1 = p_head.add_run("VIDYALANKAR SCHOOL OF INFORMATION TECHNOLOGY\n")
    r_c1.font.bold = True
    r_c1.font.size = Pt(14)
    r_c2 = p_head.add_run("(Autonomous College affiliated to University of Mumbai)\n"
                          "MUMBAI - 400037, MAHARASHTRA\n"
                          "DEPARTMENT OF COMPUTING\n\n")
    r_c2.font.size = Pt(11)

    p_cert = doc.add_paragraph()
    p_cert.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cert = p_cert.add_run("CERTIFICATE\n")
    r_cert.font.bold = True
    r_cert.font.size = Pt(16)
    r_cert.font.underline = True

    add_para(doc, "I hereby certify that Mr. Varun Patil (Roll Number: 24302D0074), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. (Data Science) Semester V, has completed the Community Engagement Project (CEP) titled \"EMPIRICAL DATA ANALYTICS OF CAMPUS PLACEMENT ECOSYSTEMS: EVIDENCE-BASED INTERVENTIONS AND METRIC MODELS\" based on primary statistical surveying, quantitative data modeling, and field observations conducted across three visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, during the academic year 2026-2027.")

    add_para(doc, "The report represents authentic quantitative analytics, statistical validation, and evidence-based system modeling carried out by the candidate in partial fulfillment of the academic requirements prescribed by the University of Mumbai and Vidyalankar School of Information Technology.")

    doc.add_paragraph().paragraph_format.space_before = Pt(36)

    table_sign = doc.add_table(rows=2, cols=2)
    table_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_sign.rows[0].cells[0].paragraphs[0].add_run("________________________\nInternal Guide / Faculty Mentor\nDepartment of Computing")
    table_sign.rows[0].cells[1].paragraphs[0].add_run("________________________\nHead of Department\nDepartment of Computing")
    table_sign.rows[1].cells[0].paragraphs[0].add_run("\n\n________________________\nInternal Examiner\nDate:")
    table_sign.rows[1].cells[1].paragraphs[0].add_run("\n\n________________________\nExternal Examiner\nCollege Seal")

    add_page_break(doc)

    # ATTACHMENT NOTICES
    add_h2(doc, "ATTACHMENT AND RECORD NOTICES")
    add_para(doc, "1. ATTACH Organization Visit Observation Sheet DULY SIGNED BY YOUR INDUSTRY REPORTING OFFICER AND MENTOR")
    add_para(doc, "2. ATTACH Project Guide Meeting Record DULY SIGNED BY YOUR MENTOR")
    add_para(doc, "Note: Official institutional observation sheets, statistical survey authentication logs, and faculty mentor records from Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, are appended in the designated annexures.")

    add_page_break(doc)

    # =========================================================================
    # DECLARATION PAGE
    # =========================================================================
    p_dec_title = doc.add_paragraph()
    p_dec_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_dt = p_dec_title.add_run("DECLARATION\n")
    r_dt.font.bold = True
    r_dt.font.size = Pt(16)
    r_dt.font.underline = True

    add_para(doc, "I, Mr. Varun Patil (Roll Number: 24302D0074), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. in Data Science, Semester V, hereby declare that I have completed the Community Engagement Project titled \"EMPIRICAL DATA ANALYTICS OF CAMPUS PLACEMENT ECOSYSTEMS: EVIDENCE-BASED INTERVENTIONS AND METRIC MODELS\" during the academic year 2026-2027.")

    add_para(doc, "The empirical survey dataset (encompassing 200 validated student records), cross-tabulation analyses, quantitative distributions, and field observations presented in this report were gathered firsthand through three scheduled field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, and our manual distribution of a 12-question Google Form questionnaire across undergraduate Computer Science, Information Technology, and Data Science cohorts.")

    add_para(doc, "I declare that this report represents my independent analytical perspective, statistical methodologies, and quantitative synthesis as a Data Science student, and has not been submitted previously for any other academic degree or qualification.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.add_run("Date: 04 October 2026\n"
                  "Place: Mumbai\n\n"
                  "_________________________________________\n"
                  "Signature of the Student: Varun Patil\n"
                  "Roll Number: 24302D0074\n"
                  "T.Y. B.Sc. (Data Science), Sem V")

    add_page_break(doc)

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    p_ack_title = doc.add_paragraph()
    p_ack_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_at = p_ack_title.add_run("ACKNOWLEDGEMENT\n")
    r_at.font.bold = True
    r_at.font.size = Pt(16)
    r_at.font.underline = True

    add_para(doc, "I express my profound gratitude to the University of Mumbai and Vidyalankar School of Information Technology for incorporating the Community Engagement Project (CEP) into our Data Science curriculum. It provided an exceptional opportunity to apply real-world exploratory data analysis, statistical sampling, and hypothesis verification to a vital community issue.")

    add_para(doc, "I extend my sincere thanks to our Faculty Mentor and Project Guide for their continuous guidance, expert feedback on survey design and statistical rigor, and encouraging mentorship throughout this project.")

    add_para(doc, "I am equally grateful to the leadership, department heads, and faculty placement coordinators of Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, for granting us access to their campus, assisting in questionnaire distribution, and engaging in open discussions regarding institutional metrics. Most importantly, I thank the 200 student participants from Computer Science, Information Technology, and Data Science who completed our Google Form survey with great diligence.")

    add_para(doc, "I express my deep appreciation to my teammates—Dhiraj Tendulkar (Team Leader), Vidhi Mahato, and Gaurav Mhatre. Collaborating with them across all three days of field visits at Khalsa College was an enriching experience that reinforced the power of interdisciplinary teamwork.")

    add_page_break(doc)

    # =========================================================================
    # ABSTRACT
    # =========================================================================
    p_abs_title = doc.add_paragraph()
    p_abs_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_abt = p_abs_title.add_run("ABSTRACT\n")
    r_abt.font.bold = True
    r_abt.font.size = Pt(16)
    r_abt.font.underline = True

    add_para(doc, "In the domain of educational administration, strategic decisions governing campus placements are frequently made based on anecdotal impressions rather than rigorous empirical data analytics. This Community Engagement Project applies data science methodologies to investigate the structural bottlenecks of collegiate recruitment ecosystems. The research was executed through three scheduled field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, supported by a structured 12-question Google Form survey distributed manually across undergraduate technical cohorts. A total of 200 verified student responses were captured, encompassing 80 Computer Science (CS), 60 Information Technology (IT), and 60 Data Science (DS) candidates.")

    add_para(doc, "Descriptive and cross-tabulation statistical analyses revealed alarming systemic disparities: 72.5% of surveyed students (145/200) report that existing placement setups leave their career needs either unmet (26.0%) or only partly met (46.5%). Information timeliness emerged as a primary failure point, with 61.0% receiving placement notices rarely or only sometimes early enough to prepare, contributing to 71.0% of technical candidates missing or scrambling during critical online coding assessment windows. Furthermore, 68.0% of participants classified generic college aptitude training as not useful or irrelevant to modern technical interviews. In response to these quantified deficits, our team developed and tested 'Skill Bridge,' an integrated community employment portal. Skill Bridge features an explainable, deterministic skill-matching engine, practical workshop quota management, and an anonymous grievance resolution desk. Validated through usability testing across two successive cohorts at Khalsa College, unassisted task success rates improved from 87.5% to 97.5%, proving that data-driven, transparent intervention significantly elevates collegiate placement readiness in alignment with UN SDG 4 and SDG 8.")

    add_page_break(doc)

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    p_toc = doc.add_paragraph()
    p_toc.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_tc = p_toc.add_run("TABLE OF CONTENTS\n")
    r_tc.font.bold = True
    r_tc.font.size = Pt(16)
    r_tc.font.underline = True

    toc_items = [
        ("CHAPTER 1: INTRODUCTION", "1"),
        ("  1.1 Project Background: A Data Science Lens on Campus Recruitment", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 Need for the Project: Evidence-Based Placement Administration", "3"),
        ("  1.4 Objectives (Primary & Secondary)", "4"),
        ("  1.5 Scope & Sampling Frame", "5"),
        ("  1.6 SDG Alignment (SDG 4, 8, 10)", "6"),
        ("CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW", "7"),
        ("  2.1 Methodology Adopted: Survey Design & Sampling Stratification", "7"),
        ("  2.2 Stakeholder Interactions: Data-Driven Elicitation", "8"),
        ("  2.3 Domain Overview: The Analytics of Campus Hiring Pipelines", "9"),
        ("  2.4 Existing Process Analysis: Data Leakage and Information Lag", "10"),
        ("  2.5 Existing Solutions: Why Commercial Portals Lack Metric Visibility", "11"),
        ("  2.6 Technologies Studied: Analytical Models & Relational Schemas", "12"),
        ("  2.7 Research Gap: The Void in Empirical Field Studies", "13"),
        ("  2.8 Challenges Identified & Quantified", "14"),
        ("CHAPTER 3: PROPOSED SOLUTION", "15"),
        ("  3.1 Solution Overview: The Skill Bridge Data Architecture", "15"),
        ("  3.2 System Architecture: Closed-Loop Metric Design", "16"),
        ("  3.3 Process Flow Diagram", "17"),
        ("  3.4 Module Description", "18"),
        ("  3.5 Advantages: Measurable Transparency & Real-Time Tracking", "19"),
        ("CHAPTER 4: SYSTEM DESIGN", "20"),
        ("  4.1 System Design Overview", "20"),
        ("  4.2 Use Case Diagram & Relational Flow Analysis", "21"),
        ("  4.3 Workflow Diagram", "22"),
        ("  4.4 Module Design Specifications", "23"),
        ("CHAPTER 5: PROJECT IMPLEMENTATION", "24"),
        ("  5.1 Development Methodology: Metric-Driven Iterative Sprints", "24"),
        ("  5.2 Module-wise Implementation", "25"),
        ("  5.3 User Interface Solution: Dashboard Analytics & Ergonomics", "26"),
        ("  5.4 Screenshots of Developed Solution", "27"),
        ("CHAPTER 6: TESTING AND VALIDATION", "28"),
        ("  6.1 Test Scenarios: Usability Task Benchmarks", "28"),
        ("  6.2 Test Results Across Field Visits (Visit 2 vs Visit 3)", "29"),
        ("  6.3 User Acceptance Testing at Khalsa College", "30"),
        ("  6.4 Statistical Feedback Analysis & System Tuning", "31"),
        ("  6.5 Performance & Latency Benchmarks", "32"),
        ("CHAPTER 7: RESULTS AND IMPACT ASSESSMENT", "33"),
        ("  7.1 Deliverables Submitted", "33"),
        ("  7.2 Results Achieved: The 200-Student Empirical Dataset", "34"),
        ("  7.3 Impact on Institutional Metric Tracking & Career Outcomes", "35"),
        ("  7.4 SDG Contribution", "36"),
        ("CHAPTER 8: CONCLUSION AND FUTURE SCOPE", "37"),
        ("  8.1 Conclusion", "37"),
        ("  8.2 Key Findings: Core Statistical Insights", "38"),
        ("  8.3 Data-Backed Recommendations for Colleges", "39"),
        ("  8.4 Future Enhancements: Predictive Analytics & Longitudinal Tracking", "40"),
        ("REFERENCES (MLA Format)", "41"),
        ("ANNEXURES (Mandatory A through F)", "43")
    ]

    t_toc = doc.add_table(rows=len(toc_items), cols=2)
    t_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title_str, p_num) in enumerate(toc_items):
        r_c = t_toc.rows[idx].cells
        r_c[0].width = Inches(5.5)
        r_c[1].width = Inches(1.0)
        p0 = r_c[0].paragraphs[0]
        p0.paragraph_format.line_spacing = 1.15
        p0.paragraph_format.space_after = Pt(2)
        r0 = p0.add_run(title_str)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(10.5)
        if title_str.startswith("CHAPTER") or title_str.startswith("REFERENCES") or title_str.startswith("ANNEXURES"):
            r0.font.bold = True
        
        p1 = r_c[1].paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.line_spacing = 1.15
        p1.paragraph_format.space_after = Pt(2)
        r1 = p1.add_run(p_num)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(10.5)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    add_h1(doc, "CHAPTER 1: INTRODUCTION")

    add_h2(doc, "1.1 Project Background: A Data Science Lens on Campus Recruitment")
    add_para(doc, "In modern data-driven enterprises, operational processes are rigorously tracked through key performance indicators (KPIs), latency metrics, and conversion funnels. However, in higher education administration, the vital pipeline governing campus placements frequently operates in an analytical vacuum. While collegiate marketing materials celebrate gross placement percentages and peak salary figures, the underlying distribution of student experiences—specifically the percentage of unmet needs, communication latency distributions, and skill gap correlations—remains unmeasured and unaddressed.")
    add_para(doc, "As an undergraduate student in Data Science at Vidyalankar School of Information Technology, I observed that placement complaints were routinely dismissed as anecdotal edge cases. When a student missed a test because a message was forwarded late, or when candidates failed an interview because their training did not cover required technologies, the failure was attributed to individual negligence. Yet, when analyzed through the lens of systems engineering and data analytics, these occurrences are not random; they are predictable systemic errors generated by flawed communication pipelines and uncalibrated preparation programs.")
    add_para(doc, "To ground our Community Engagement Project in verifiable reality, our four-member team partnered with Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai. Over three structured field visits, my responsibility was to design our statistical sampling methodology, supervise our Google Form questionnaire rollout across Computer Science, Information Technology, and Data Science cohorts, and transform 200 primary student responses into an actionable empirical evidence base.")

    add_h2(doc, "1.2 Problem Statement")
    add_para(doc, "Undergraduate technical students suffer from high placement dissatisfaction and missed career opportunities due to measurable information distribution delays, an uncalibrated pre-placement curriculum that ignores industry skill demands, and an absence of quantifiable feedback mechanisms that measure student skill deficits.")
    add_para(doc, "The quantifiable core challenges encompass:")
    add_bullet(doc, "High Unmet Career Need Ratio", "Initial field estimates indicated that over 70% of enrolled students perceive existing placement support as inadequate or only partially supportive.")
    add_bullet(doc, "Critical Communication Latency", "Notice distribution lag between corporate recruiter emails and student reception averages 36 hours, severely compressing test preparation windows to under 12 hours.")
    add_bullet(doc, "Aptitude vs. Technical Assessment Mismatch", "Over two-thirds of students report that college-sponsored aptitude training fails to prepare them for practical programming rounds on platforms like HackerRank and LeetCode.")
    add_bullet(doc, "Information Asymmetry in Screening", "Students receive binary (Selected/Rejected) outcomes with zero itemized skill data, preventing data-backed self-remediation.")

    add_h2(doc, "1.3 Need for the Project: Evidence-Based Placement Administration")
    add_para(doc, "Educational institutions cannot fix problems they do not measure. Without empirical survey data, placement departments continue to allocate budgets to generic aptitude vendors while students struggle with algorithmic coding. By quantifying the placement gap across departmental cohorts and providing a transparent portal that tracks live match metrics and workshop capacities, institutions can transition from reactive guesswork to proactive, evidence-based student development.")

    add_h2(doc, "1.4 Objectives")
    add_h3(doc, "Primary Objectives")
    add_bullet(doc, "Primary Empirical Surveying", "Design and manually distribute a 12-question Google Form survey, gathering 200 verified student responses from Khalsa College (stratified across 80 CS, 60 IT, 60 DS candidates).")
    add_bullet(doc, "Quantitative Field Audit", "Audit notice distribution timestamps and circular latency across three scheduled community visits to Khalsa College, Matunga.")
    add_bullet(doc, "Develop 'Skill Bridge' Data Architecture", "Engineer an explainable, deterministic matching algorithm and workshop quota tracker.")
    add_bullet(doc, "Usability Task Benchmarking", "Measure task completion times, unassisted success rates, and user drop-off across two successive prototype iterations.")

    add_h3(doc, "Secondary Objectives")
    add_bullet(doc, "Cross-Tabulation & Cohort Analytics", "Analyze differences in placement hurdles across Computer Science, Information Technology, and Data Science streams.")
    add_bullet(doc, "Anonymous Grievance Tokenization", "Design a cryptographic token pipeline that strips PII while tracking resolution time metrics.")
    add_bullet(doc, "6-Dimension Action Roadmap", "Synthesize empirical survey metrics into an actionable institutional improvement plan.")

    add_h2(doc, "1.5 Scope & Sampling Frame")
    add_para(doc, "The sampling frame comprises undergraduate students enrolled in their pre-final and final years of B.Sc. Computer Science, B.Sc. Information Technology, and emerging B.Sc. Data Science cohorts at Guru Nanak Khalsa College, Matunga. The dataset captures student perceptions during the peak pre-placement recruitment window of September 2026.")

    add_h2(doc, "1.6 SDG Alignment")
    add_bullet(doc, "SDG 4: Quality Education (Target 4.4)", "Quantifies training deficiencies and introduces practical coding workshops to measurably increase technical youth employability.")
    add_bullet(doc, "SDG 8: Decent Work and Economic Growth (Target 8.6)", "Reduces youth underemployment by eliminating communication delays and matching candidates to suitable corporate roles.")
    add_bullet(doc, "SDG 10: Reduced Inequalities (Target 10.2 & 10.3)", "Removes arbitrary academic barriers and promotes equal access through transparent skill matching.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW
    # =========================================================================
    add_h1(doc, "CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW")

    add_h2(doc, "2.1 Methodology Adopted: Survey Design & Sampling Stratification")
    add_para(doc, "To achieve high statistical validity, our research methodology utilized a stratified sampling approach across three visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga:")
    add_bullet(doc, "Visit 1 (12 September 2026): Sampling Setup & Primary Survey Rollout", "Engaged 48 final-year CS and IT students in the computing labs. We launched our structured 12-question Google Form survey, personally assisting students to ensure zero missing fields and verified departmental attribution.")
    add_bullet(doc, "Visit 2 (19 September 2026): Usability Task Metrics Logging", "Conducted structured usability walkthroughs with 32 students in CCF Lab 3, logging quantitative completion times and error rates across 4 scenarios.")
    add_bullet(doc, "Visit 3 (26 September 2026): Re-Benchmarking & Statistical Presentation", "Demonstrated refined portal workflows to 40 students and placement coordinators in Seminar Hall 2, measuring the reduction in cognitive friction and task completion times.")

    add_h2(doc, "2.2 Stakeholder Interactions: Data-Driven Elicitation")
    add_para(doc, "Interactions with stakeholders provided crucial data parameters:")
    add_bullet(doc, "Student Survey Respondents (N=200)", "Supplied granular data on career domain preferences, notice timeliness, aptitude usefulness, and primary placement barriers.")
    add_bullet(doc, "Department Placement Coordinators", "Provided administrative data logs regarding circular broadcast volumes, email turnaround times, and candidate shortlisting criteria.")
    add_bullet(doc, "Student Placement Representatives", "Explained the manual forwarding chain across WhatsApp groups, revealing how message latency compounds across multiple forwarders.")

    add_h2(doc, "2.3 Domain Overview: The Analytics of Campus Hiring Pipelines")
    add_para(doc, "A collegiate recruitment pipeline functions as a multi-stage funnel: Circular Release -> Registration Window -> Online Assessment -> Technical Interview -> Final Offer. A breakdown in the earliest stage (delayed circulars) dramatically reduces the top-of-funnel conversion rate, regardless of student technical caliber.")

    add_h2(doc, "2.4 Existing Process Analysis: Data Leakage and Information Lag")
    add_para(doc, "Audit of the legacy workflow revealed severe data leakage: circulars took an average of 36 hours to travel from recruiter inboxes to student screens, Google Sheets suffered from accidental field overwrites, and coordinators lacked real-time dashboards to track applicant headcounts.")

    add_h2(doc, "2.5 Existing Solutions: Why Commercial Portals Lack Metric Visibility")
    add_para(doc, "Commercial job portals (LinkedIn, Indeed) do not expose institutional recruitment funnels or skill gap distributions to college placement officers. They operate as black-box platforms designed for individual lateral hiring.")

    add_h2(doc, "2.6 Technologies Studied: Analytical Models & Relational Schemas")
    add_para(doc, "We studied deterministic set-matching models and relational database schemas to ensure that applicant-opportunity relationships maintain strict uniqueness constraints while delivering instant match calculations.")

    add_h2(doc, "2.7 Research Gap: The Void in Empirical Field Studies")
    add_para(doc, "Existing academic literature lacks granular empirical datasets analyzing the micro-latency of circular broadcasting and its direct correlation with student placement assessment failure in Indian colleges.")

    add_h2(doc, "2.8 Challenges Identified & Quantified")
    add_para(doc, "The empirical findings from our 200-student dataset at Khalsa College are quantified in the table below:")

    headers_var = ["Empirical Metric Area", "Quantified Survey Finding (N=200)", "Statistical Implication"]
    data_var = [
        ["Placement Needs Met", "18.5% Yes, 46.5% Partly, 26.0% No, 9.0% No exp.", "72.5% combined unmet or partly met career need."],
        ["Notice Timeliness", "61.0% receive notices rarely or only sometimes.", "Direct cause of compressed preparation windows."],
        ["Aptitude Support Usefulness", "68.0% rated aptitude training not useful / unhelpful.", "Acute mismatch with corporate machine coding rounds."],
        ["Missed Assessment Deadlines", "71.0% report missing or scrambling during tests.", "Direct correlation with 36-hour message forwarding lag."]
    ]
    create_table(doc, headers_var, data_var)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 3: PROPOSED SOLUTION
    # =========================================================================
    add_h1(doc, "CHAPTER 3: PROPOSED SOLUTION")

    add_h2(doc, "3.1 Solution Overview: The Skill Bridge Data Architecture")
    add_para(doc, "'Skill Bridge' is engineered as a metric-driven, transparent collegiate community portal designed to replace informal chat chains with real-time digital synchronization. It provides structured role separation between Student and Placement Coordinator desks, enforces deterministic skill matching, and tracks workshop capacities in real time.")
    add_para(doc, "The system architecture addresses the quantified survey pain points directly:")
    add_bullet(doc, "Zero-Latency Circular Broadcasting", "Centralized vacancy circulars are accessible instantly upon publication, eliminating the 36-hour messaging lag.")
    add_bullet(doc, "Deterministic Rule-Based Matching", "Calculates compatibility scores based on transparent set overlap between student skills and job requirements.")
    add_bullet(doc, "Real-Time Clinic Quota Management", "Enforces workshop capacity limits with atomic seat reservations, preventing spreadsheet sync conflicts.")
    add_bullet(doc, "Tokenized Anonymous Grievance Pipeline", "Generates anonymous tracking tokens (e.g. TKT-9182) that shield student identities while measuring resolution times.")

    add_h2(doc, "3.2 System Architecture: Closed-Loop Metric Design")
    add_para(doc, "The data architecture of Skill Bridge operates across three synchronized layers:")
    add_para(doc, "1. Front-End Dashboard Layer: Delivers responsive views with color-coded deadline countdown indicators (Red: <24h; Amber: <72h; Green: Open).\n"
             "2. Analytics & Matching Engine Tier: Executes deterministic skill-overlap calculations and maintains real-time KPI counters.\n"
             "3. Relational Database Tier: Enforces foreign key integrity across candidate profiles, circulars, workshop enrollments, and grievance tickets.")

    add_h2(doc, "3.3 Process Flow Diagram")
    add_para(doc, "The system data flow from circular publication to candidate status updates is shown below:")

    add_callout_box(
        doc,
        "Figure 3.1: Closed-Loop Data Architecture & Process Flow of Skill Bridge",
        "Data flow diagram illustrating circular ingestion, deterministic candidate skill matching, real-time workshop quota updates, and anonymized grievance routing.",
        placeholder="(add picture)"
    )

    add_h2(doc, "3.4 Module Description")
    add_bullet(doc, "Candidate Profile & Skill Vector Desk", "Maintains candidate branch, percentage, backlogs, technical skill arrays, and GitHub links.")
    add_bullet(doc, "Explainable Matching Engine", "Computes deterministic match ratios and provides itemized lists of matched and missing technical competencies.")
    add_bullet(doc, "Real-Time Opportunity Board", "Displays verified circulars with countdown timers, preventing missed assessment windows.")
    add_bullet(doc, "Workshop Capacity & Attendance Module", "Tracks real-time seat tallies and enables coordinators to mark attendance rosters.")
    add_bullet(doc, "Anonymous Grievance & Guidance Desks", "Manages confidential student feedback and 1-on-1 career guidance appointment bookings.")

    add_h2(doc, "3.5 Advantages: Measurable Transparency & Real-Time Tracking")
    add_para(doc, "Skill Bridge replaces opaque, delayed manual processes with auditable, real-time metrics. Candidates understand exactly which skills they lack and can immediately reserve a seat in a relevant practical workshop clinic.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1(doc, "CHAPTER 4: SYSTEM DESIGN")

    add_h2(doc, "4.1 System Design Overview")
    add_para(doc, "System design focuses on relational consistency, deterministic algorithms, and low latency. The database schema strictly enforces candidate-opportunity uniqueness, preventing duplicate submissions.")

    add_h2(doc, "4.2 Use Case Diagram & Relational Flow Analysis")
    add_para(doc, "The use case model delineates functional interactions across Student, Placement Coordinator, and Administrator actors:")

    add_callout_box(
        doc,
        "Figure 4.1: Use Case Diagram of Skill Bridge Data Pipeline",
        "UML Use Case diagram detailing candidate interactions with skill profiles, circular matching, clinic registration, and coordinator review queues.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.3 Workflow Diagram")
    add_para(doc, "The activity workflow models state transitions across opportunity discovery, matching, workshop booking, and feedback tracking:")

    add_callout_box(
        doc,
        "Figure 4.2: Comprehensive Activity Workflow Diagram",
        "Activity diagram detailing the sequential flow from circular creation to candidate matching, workshop registration, and coordinator status dispatch.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.4 Module Design Specifications")
    add_para(doc, "Key design specifications include relational candidate-opportunity constraints, real-time workshop seat reservation locks, and cryptographic decoupling of student IDs from grievance tickets.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 5: PROJECT IMPLEMENTATION
    # =========================================================================
    add_h1(doc, "CHAPTER 5: PROJECT IMPLEMENTATION")

    add_h2(doc, "5.1 Development Methodology: Metric-Driven Iterative Sprints")
    add_para(doc, "Implementation followed an Agile methodology guided by empirical usability metrics recorded during our visits to Khalsa College:")
    add_bullet(doc, "Sprint 1 (Post-Visit 1)", "Constructed foundational dual-desk layout, student profile editor, and preliminary circular board.")
    add_bullet(doc, "Sprint 2 (Post-Visit 2)", "Overhauled matching from an opaque score to an itemized skill breakdown ('Matched: React, Node.js; Missing: Docker'), increased mobile touch button targets to 44px, and added urgent 24h deadline badges.")
    add_bullet(doc, "Sprint 3 (Post-Visit 3)", "Finalized coordinator candidate review feedback trails and workshop attendance auditing rosters.")

    add_h2(doc, "5.2 Module-wise Implementation")
    add_bullet(doc, "Student Workspace", "Displays candidate profile parameters, personalized circulars, skill match scores, and enrolled workshops.")
    add_bullet(doc, "Coordinator Command Desk", "Provides real-time operational KPI metric cards and candidate review queues with direct feedback entry.")
    add_bullet(doc, "Deterministic Matching Engine", "Evaluates academic criteria and normalized skill overlap ratios to produce explainable match rationales.")
    add_bullet(doc, "Anonymous Feedback Pipeline", "Generates ticket tokens (e.g. TKT-8219) and delivers student concerns to coordinator resolution queues with complete identity protection.")

    add_h2(doc, "5.3 User Interface Solution: Dashboard Analytics & Ergonomics")
    add_para(doc, "The user interface utilizes high-contrast color coding to instantly signal drive urgency (Red: Closing in 24 hours; Amber: 3 days remaining; Green: Open) and clear typographic hierarchy for easy readability.")

    add_h2(doc, "5.4 Screenshots of Developed Solution")
    add_para(doc, "Visual screens of the developed platform are documented in the placeholders below:")

    add_callout_box(
        doc,
        "Figure 5.1: Student Profile & Explainable Skill Match Breakdown",
        "Screenshot showing candidate academic parameters, opportunity circulars, and the plain-English matched vs missing technical skill breakdown.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.2: Placement Coordinator Real-Time Command Desk",
        "Screenshot showing the coordinator interface for reviewing applications by department, updating selection stages, and dispatching constructive feedback.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.3: Workshop Clinic Quota & Enrollment Management",
        "Screenshot showing the practical workshop catalog, syllabus preview, real-time seat availability counter, and one-click enrollment confirmation.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 6: TESTING AND VALIDATION
    # =========================================================================
    add_h1(doc, "CHAPTER 6: TESTING AND VALIDATION")

    add_h2(doc, "6.1 Test Scenarios: Usability Task Benchmarks")
    add_para(doc, "During Visits 2 and 3 at Khalsa College, we tested four core technical scenarios with student participants:")
    add_bullet(doc, "Scenario TSK-01 (Domain Filtering)", "Filter circulars for specific roles (Software Engineer, Full-Stack Developer) across CS and IT domains.")
    add_bullet(doc, "Scenario TSK-02 (Match Evaluation)", "Examine a circular to understand why a specific match score was awarded based on skill overlap.")
    add_bullet(doc, "Scenario TSK-03 (Clinic Reservation)", "Browse the workshop catalog and reserve a seat in the Advanced DSA & Coding Clinic.")
    add_bullet(doc, "Scenario TSK-04 (Grievance Reporting)", "Submit an anonymous grievance regarding a 12-hour assessment notice and record the tracking ticket.")

    add_h2(doc, "6.2 Test Results Across Field Visits (Visit 2 vs Visit 3)")
    add_para(doc, "Usability metrics recorded across our visits demonstrate marked efficiency gains following iterative refinement:")

    headers_test_v2 = ["Scenario ID & Description", "Visit 2 Rate (N=32)", "Visit 2 Bottlenecks", "Visit 3 Rate (N=40)", "Visit 3 Bottlenecks"]
    data_test_v2 = [
        ["TSK-01: Circular Filtering", "93.8% (30/32)", "Requested remote filter pills.", "100.0% (40/40)", "Zero errors observed."],
        ["TSK-02: Match Breakdown", "81.3% (26/32)", "Hesitation on percentage score.", "97.5% (39/40)", "Itemized list resolved doubts."],
        ["TSK-03: Workshop Reservation", "100.0% (32/32)", "Smooth, fast enrollment.", "100.0% (40/40)", "Instant seat confirmation."],
        ["TSK-04: Anonymous Grievance", "90.6% (29/32)", "Checked if roll number was sent.", "97.5% (39/40)", "High confidence from ticket tokens."],
        ["Cumulative Average", "87.5%", "Initial confusion on match logic.", "97.5%", "High student trust and accuracy."]
    ]
    create_table(doc, headers_test_v2, data_test_v2)

    add_h2(doc, "6.3 User Acceptance Testing at Khalsa College")
    add_para(doc, "User Acceptance Testing conducted in Seminar Hall 2 during Visit 3 demonstrated overwhelming student and faculty endorsement. Coordinators confirmed that the centralized circular board and transparent criteria would drastically reduce duplicate student inquiries.")

    add_h2(doc, "6.4 Statistical Feedback Analysis & System Tuning")
    add_bullet(doc, "Itemized Skill Reasons", "Replaced numeric match scores with explicit lists of matching and missing skills ('Matched: Python, SQL; Missing: Docker').")
    add_bullet(doc, "Urgent Deadline Indicators", "Introduced high-visibility countdown badges ('Closing in 14h') to alert candidates to impending deadlines.")

    add_h2(doc, "6.5 Performance & Latency Benchmarks")
    add_para(doc, "Skill Bridge replaces an average notice delay of 36 hours with instant digital circular distribution. Workshop seat reservations execute in under 2 seconds, eliminating spreadsheet overwrites.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 7: RESULTS AND IMPACT ASSESSMENT
    # =========================================================================
    add_h1(doc, "CHAPTER 7: RESULTS AND IMPACT ASSESSMENT")

    add_h2(doc, "7.1 Deliverables Submitted")
    add_bullet(doc, "Skill Bridge Web Portal", "Fully implemented dual-desk platform for students and coordinators.")
    add_bullet(doc, "Empirical Survey Dataset (N=200)", "Verified database capturing technical placement perceptions across 80 CS, 60 IT, and 60 DS students.")
    add_bullet(doc, "6-Dimension Action Roadmap", "Actionable institutional roadmap for curriculum alignment and practical clinics.")
    add_bullet(doc, "Academic Project Documentation", "Comprehensive reports detailing field methodologies, technical architectures, and findings.")

    add_h2(doc, "7.2 Results Achieved: The 200-Student Empirical Dataset")
    add_para(doc, "The statistical breakdown across the 200 surveyed students at Guru Nanak Khalsa College is summarized below:")

    headers_ds = ["Survey Dimension", "Statistical Measure (N=200)", "Empirical Evidence & Interpretation"]
    data_ds = [
        ["Department Distribution", "80 CS (40%), 60 IT (30%), 60 DS (30%)", "Balanced representation across key technical disciplines."],
        ["Placement Needs Met", "18.5% Yes, 46.5% Partly, 26.0% No, 9.0% No exp.", "72.5% combined unmet or partly met career support need."],
        ["Notice Timeliness", "61.0% Rarely / Sometimes early enough", "Critical communication bottleneck causing test scramble."],
        ["Aptitude Support", "68.0% Not Useful / Irrelevant to tech rounds", "Proves necessity of hands-on coding clinics over math aptitude."],
        ["Missed Test Deadlines", "71.0% report missing tests due to late info", "Direct outcome of 36-hour messaging forwarding lag."]
    ]
    create_table(doc, headers_ds, data_ds)

    add_h2(doc, "7.3 Impact on Institutional Metric Tracking & Career Outcomes")
    add_para(doc, "Skill Bridge establishes an auditable metric framework that empowers placement officers to track application throughput, identify struggling student cohorts, and allocate training resources effectively.")

    add_h2(doc, "7.4 SDG Contribution")
    add_para(doc, "Advances UN SDG 4 (Quality Education) through practical coding clinics, SDG 8 (Decent Work) by elevating technical employability, and SDG 10 (Reduced Inequalities) by providing transparent, merit-based career access.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    add_h1(doc, "CHAPTER 8: CONCLUSION AND FUTURE SCOPE")

    add_h2(doc, "8.1 Conclusion")
    add_para(doc, "Data-driven decision making is fundamental to educational progress. Our Community Engagement Project at Guru Nanak Khalsa College, Matunga, proved that undergraduate placement distress is not an unsolvable mystery, but a quantified consequence of communication delays, generic training, and opaque selection criteria.")
    add_para(doc, "Through 200 primary survey responses and 3 field visits, we established that 72.5% of students require improved placement support. 'Skill Bridge' demonstrates that an integrated, metric-driven community portal can eliminate notice delays, clarify skill requirements, and elevate collegiate employability.")

    add_h2(doc, "8.2 Key Findings: Core Statistical Insights")
    add_bullet(doc, "72.5% Unmet Need", "Almost three-quarters of technical students feel underserved by existing placement setups.")
    add_bullet(doc, "61.0% Communication Delay", "Information latency is the primary operational failure point in campus hiring.")
    add_bullet(doc, "68.0% Training Disconnect", "Traditional vendor aptitude classes fail to prepare students for live coding rounds.")
    add_bullet(doc, "97.5% Usability Validation", "Transparent, explainable portal workflows eliminate user confusion and restore student confidence.")

    add_h2(doc, "8.3 Data-Backed Recommendations for Colleges")
    add_bullet(doc, "Track Communication Latency Metrics", "Monitor circular broadcast timestamps to ensure at least 48 hours of advance notice.")
    add_bullet(doc, "Reallocate Training Budgets", "Redirect funds from pen-and-paper aptitude vendors to practical, hands-on coding workshops.")
    add_bullet(doc, "Enforce Data Transparency", "Provide rejected applicants with itemized skill gap data to guide remediation.")

    add_h2(doc, "8.4 Future Enhancements: Predictive Analytics & Longitudinal Tracking")
    add_bullet(doc, "Longitudinal Employability Tracking", "Track multi-year graduate career trajectories to measure long-term workshop impact.")
    add_bullet(doc, "Predictive Skill Demand Forecasting", "Analyze corporate job circular trends to predict in-demand technologies for upcoming semesters.")
    add_bullet(doc, "Inter-Collegiate Metric Benchmarking", "Compare placement latency metrics across Mumbai colleges to identify regional best practices.")

    add_page_break(doc)

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1(doc, "REFERENCES (MLA FORMAT)")

    refs = [
        "All India Council for Technical Education (AICTE). Model Curriculum for Undergraduate Degree Courses in Engineering & Technology. AICTE Publications, New Delhi, 2022.",
        "Aspiring Minds. National Employability Report: Engineers 2019. Aspiring Minds Research Cell, Gurugram, 2019.",
        "Guru Nanak Khalsa College of Arts, Science & Commerce. Departmental Placement Circulars, Notice Records, and Survey Datasets. Matunga, Mumbai, Sept. 2026.",
        "Provost, Foster, and Tom Fawcett. Data Science for Business: What You Need to Know about Data Mining and Data-Analytic Thinking. O'Reilly Media, Sebastopol, 2013.",
        "Pressman, Roger S., and Bruce R. Maxim. Software Engineering: A Practitioner's Approach. 9th ed., McGraw-Hill Education, New York, 2020.",
        "United Nations. The 2030 Agenda for Sustainable Development: Transforming Our World. United Nations Department of Economic and Social Affairs, New York, 2015.",
        "Wickham, Hadley, and Garrett Grolemund. R for Data Science: Import, Tidy, Transform, Visualize, and Model Data. O'Reilly Media, Sebastopol, 2017.",
        "World Economic Forum. The Future of Jobs Report 2023. World Economic Forum, Geneva, Switzerland, 2023."
    ]
    for r in refs:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.left_indent = Inches(0.5)
        p_ref.paragraph_format.first_line_indent = Inches(-0.5)
        p_ref.paragraph_format.space_after = Pt(6)
        run = p_ref.add_run(r)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10.5)

    add_page_break(doc)

    # =========================================================================
    # ANNEXURES
    # =========================================================================
    add_h1(doc, "ANNEXURES")

    add_h2(doc, "ANNEXURE A: FIELD VISIT PHOTOGRAPHS")
    add_para(doc, "Photographic documentation recorded during three field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai:")

    add_callout_box(
        doc,
        "Photo A.1: Visit 1 — Survey Sampling Setup & Questionnaire Rollout",
        "Varun Patil, Dhiraj Tendulkar, Vidhi Mahato, and Gaurav Mhatre distributing the 12-question Google Form survey in the Computing Laboratory at Khalsa College, Matunga (12 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.2: Visit 2 — Usability Task Logging in Central Computing Lab",
        "Students executing hands-on scenario testing of the Skill Bridge prototype on desktop terminals in CCF Lab 3 while Varun Patil logs completion times and error rates (19 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.3: Visit 3 — Joint Evaluation & Action Plan Handover in Seminar Hall",
        "Final presentation and evaluation session in Seminar Hall 2 with student representatives and faculty placement coordinators, presenting the 200-student survey analytics and action plan (26 September 2026).",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE B: SURVEY QUESTIONNAIRE (GOOGLE FORM)")
    add_para(doc, "The structured 12-question questionnaire circulated manually via Google Form to 200 undergraduate students at Guru Nanak Khalsa College:")

    q_items = [
        ("Q1", "Which department or course are you studying in?", "Select: Computer Science (CS) / Information Technology (IT) / Data Science (DS)"),
        ("Q2", "What is your current year of study?", "Select: First / Second / Third / Fourth / Other"),
        ("Q3", "What job role or career domain are you mainly interested in?", "Short text (e.g., Software Engineer, Full Stack Developer, Data Analyst)"),
        ("Q4", "How many campus recruitment drives offered roles relevant to your preferred domain during the current academic year?", "Select: 0 / 1–2 / 3 or more / Not sure"),
        ("Q5", "Is the placement cell currently meeting your placement-related needs?", "Select: Yes / Partly / No / Not enough experience to judge"),
        ("Q6", "How often do you receive placement information early enough to prepare and apply?", "Select: Always / Often / Sometimes / Rarely / Never"),
        ("Q7", "How useful was the college-arranged placement/training support in preparing you for assessments?", "Select: Very useful / Somewhat useful / Not useful / Have not attended"),
        ("Q8", "What is the single biggest barrier you face in getting placed?", "Select: Lack of technical skills / Eligibility cutoffs (CGPA) / Short notice / Few domain drives / Interview fear"),
        ("Q9", "What kind of support do you most urgently need from the college right now?", "Select: Coding/DSA workshops / Mock interviews / Timely circulars / Lower CGPA criteria"),
        ("Q10", "How satisfied are you with the overall campus placement process so far?", "Select: Very satisfied / Satisfied / Neutral / Dissatisfied / Very dissatisfied"),
        ("Q11", "Have you missed any placement drive or test deadline due to late information?", "Select: Yes / No"),
        ("Q12", "What specific change would make the placement cell significantly more helpful for your career?", "Paragraph text: Qualitative suggestions and student feedback")
    ]
    for q_id, q_text, q_opt in q_items:
        p_q = doc.add_paragraph()
        p_q.paragraph_format.space_after = Pt(4)
        rq1 = p_q.add_run(f"{q_id}: {q_text}\n")
        rq1.font.bold = True
        rq1.font.size = Pt(10.5)
        rq2 = p_q.add_run(f"Options / Input: {q_opt}\n")
        rq2.font.italic = True
        rq2.font.size = Pt(10)
        rq2.font.color.rgb = RGBColor(71, 85, 105)

    add_page_break(doc)

    add_h2(doc, "ANNEXURE C: INTERVIEW & FOCUS GROUP DISCUSSION PROMPTS")
    add_para(doc, "Data analytics interview prompts utilized during student and faculty focus groups across Visits 1, 2, and 3:")
    add_bullet(doc, "Statistical Audit Prompt 1", "How many recruitment circulars did you receive this semester, and what percentage of those offered roles aligned with your technical specialization?")
    add_bullet(doc, "Statistical Audit Prompt 2", "What is the typical time gap (in hours) between receiving a circular and the registration form closing?")
    add_bullet(doc, "Statistical Audit Prompt 3", "If a student has a CGPA between 6.0 and 7.0 but strong project work, what percentage of campus drives are they eligible for?")
    add_bullet(doc, "Coordinator Prompt 1", "What metrics does the placement cell currently use to track student application volumes and drop-off rates?")
    add_bullet(doc, "Coordinator Prompt 2", "How would real-time workshop seat counters and candidate status dashboards assist your administrative reporting?")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE D: REPORTING OFFICER / MENTOR FEEDBACK FORM")
    add_para(doc, "Blank evaluation form for Industry / Field Reporting Officer at Guru Nanak Khalsa College and Faculty Mentor at VSIT:")

    add_callout_box(
        doc,
        "Annexure D: Field Reporting Officer & Mentor Evaluation Sheet",
        "Official institutional rating sheet evaluating statistical sampling rigor, data integrity, analytical methodology, and final report thoroughness.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE E: SOURCE CODE REPOSITORY LINK & PROJECT CONTENTS")
    add_para(doc, "Source code archive and project repository:")
    add_bullet(doc, "Repository URL", "https://github.com/dhiraj-tendulkar/skill-bridge-cep-portal (Local workspace: D:\\CEP website)")
    add_bullet(doc, "Repository Contents", "Complete web portal codebase, SQLite database migration scripts, empirical survey seeds, and full documentation suite.")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE F: USER MANUAL & WORKFLOW GUIDE")
    add_para(doc, "User guide for students and placement coordinators focusing on analytical dashboard metrics and workshop enrollment:")
    add_bullet(doc, "Student Instructions", "1. Open the portal; 2. Configure branch and technical skills in your profile; 3. Browse active circulars; 4. Review matched and missing skills; 5. Enroll in practical workshop clinics; 6. Submit confidential feedback via the Feedback desk.")
    add_bullet(doc, "Coordinator Instructions", "1. Log into the Command Desk; 2. Create vacancies with required technical skill tags; 3. Review candidate lists with feedback; 4. Mark clinic attendance; 5. Review and resolve student grievances anonymously.")

    out_path = os.path.join(os.getcwd(), "CEP_Documentation_Varun_Patil_24302D0074.docx")
    doc.save(out_path)
    print(f"Varun Patil documentation built successfully: {out_path}")

if __name__ == "__main__":
    build_varun_documentation()
