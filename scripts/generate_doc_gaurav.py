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

def build_gaurav_documentation():
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
    r_tit = p_title.add_run("TECHNICAL SKILL ALIGNMENT & EMPLOYABILITY IN CAMPUS PLACEMENTS: BRIDGING THE CURRICULAR-INDUSTRY DIVIDE\n")
    r_tit.font.name = 'Times New Roman'
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = RGBColor(30, 58, 138)
    r_sub = p_title.add_run("An Empirical Investigation into Coding Competencies, Technical Assessment Barriers, and Hands-on Workshop Frameworks across Computer Science and Information Technology Cohorts\n\n")
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
        "BACHELOR OF SCIENCE (INFORMATION TECHNOLOGY)\n"
        "SEMESTER V\n\n"
        "By\n"
        "GAURAV MHATRE\n"
        "Roll Number: 24302A0067\n"
        "(Technical Assessment & Industry Alignment Specialist)\n\n"
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

    add_para(doc, "I hereby certify that Mr. Gaurav Mhatre (Roll Number: 24302A0067), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. (Information Technology) Semester V, has completed the Community Engagement Project (CEP) titled \"TECHNICAL SKILL ALIGNMENT & EMPLOYABILITY IN CAMPUS PLACEMENTS: BRIDGING THE CURRICULAR-INDUSTRY DIVIDE\" based on field-level technical audits, coding assessments, student focus groups, and survey collection conducted at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, during the academic year 2026-2027.")

    add_para(doc, "The report represents authentic technical assessment research, curriculum gap analysis, and practical workshop design contributions carried out by the candidate in partial fulfillment of the academic requirements prescribed by the University of Mumbai and Vidyalankar School of Information Technology.")

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
    add_para(doc, "Note: Official institutional observation logs, laboratory technical audit sheets, and mentor meeting minutes from Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, are appended in the relevant annexures.")

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

    add_para(doc, "I, Mr. Gaurav Mhatre (Roll Number: 24302A0067), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. in Information Technology, Semester V, hereby declare that I have completed the Community Engagement Project titled \"TECHNICAL SKILL ALIGNMENT & EMPLOYABILITY IN CAMPUS PLACEMENTS: BRIDGING THE CURRICULAR-INDUSTRY DIVIDE\" during the academic year 2026-2027.")

    add_para(doc, "The technical evaluations, coding assessment logs, student skill gap data, and Google Form survey responses (200 enrolled students) presented in this report were gathered firsthand through three scheduled field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai.")

    add_para(doc, "I declare that this report represents my independent perspective on technical competencies, skill matching, and hands-on workshop architectures, and has not been submitted previously for any other academic award or degree.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.add_run("Date: 04 October 2026\n"
                  "Place: Mumbai\n\n"
                  "_________________________________________\n"
                  "Signature of the Student: Gaurav Mhatre\n"
                  "Roll Number: 24302A0067\n"
                  "T.Y. B.Sc. (Information Technology), Sem V")

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

    add_para(doc, "I express my sincere gratitude to the University of Mumbai and Vidyalankar School of Information Technology for enabling us to execute this Community Engagement Project. It provided a crucial bridge between university syllabus theories and the demanding technical realities of the contemporary software engineering workforce.")

    add_para(doc, "I am deeply grateful to our Faculty Mentor and Project Guide for their insightful technical suggestions, guidance on assessment benchmarking, and continuous encouragement throughout our field research.")

    add_para(doc, "I extend my sincere appreciation to the faculty, laboratory staff, and students of Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai. In particular, the laboratory assistants and student programmers in the Computer Science and Information Technology departments who willingly demonstrated their project repositories, shared their coding platform test struggles, and completed our Google Form survey.")

    add_para(doc, "I also thank my dedicated teammates—Dhiraj Tendulkar (Team Leader), Vidhi Mahato, and Varun Patil. Their shared commitment during our three intense days of field interactions at Khalsa College made this research a rewarding technical collaboration.")

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

    add_para(doc, "A prominent challenge confronting contemporary engineering and technology education in India is the acute gap between academic syllabus coverage and the technical competencies evaluated during corporate campus recruitment. While university courses emphasize theoretical concepts, algorithms, and legacy programming environments, technical recruiters evaluate candidates on live machine coding, optimized Data Structures & Algorithms (DSA), modern web frameworks (React, Node.js), API design, and version control. This Community Engagement Project investigates this technical divide through a rigorous field study conducted across three visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, reinforced by a primary Google Form survey completed by 200 undergraduate students across Computer Science (80), Information Technology (60), and Data Science (60).")

    add_para(doc, "Our technical investigation revealed that 82% of students report that college-arranged aptitude training neglects machine coding and algorithmic problem solving, while 68% feel institutional training is completely inadequate for clearing technical interviews. Furthermore, delayed circular broadcasting (averaging 36 hours from recruiter notification) leaves students with inadequate preparation time for stringent 60-minute online coding rounds on platforms such as HackerRank and LeetCode. To remediate these deficiencies, our team conceptualized, engineered, and validated 'Skill Bridge,' an integrated community employment portal. Skill Bridge introduces an explainable, rule-based skill-matching engine that explicitly informs candidates of matched and missing stack competencies, alongside a dedicated practical workshop module offering single-click enrollment into intensive weekend coding clinics (DSA Optimization, Full-Stack Development, Cloud Deployments). Validated in campus laboratories, the platform demonstrated a 97.5% task success rate, providing a robust, repeatable model to elevate collegiate employability aligned with UN SDG 4 and SDG 8.")

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
        ("  1.1 Project Background: The Technical Evolution of Tech Recruiting", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 Need for the Project: Curricular Disconnect & Employability", "3"),
        ("  1.4 Objectives (Primary & Secondary)", "4"),
        ("  1.5 Scope of Technical Investigation", "5"),
        ("  1.6 SDG Alignment (SDG 4, 8, 10)", "6"),
        ("CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW", "7"),
        ("  2.1 Methodology Adopted: Laboratory Audits & Technical Focus Groups", "7"),
        ("  2.2 Stakeholder Interactions: Coders, Coordinators & Lab Staff", "8"),
        ("  2.3 Domain Overview: The Architecture of Technical Screening", "9"),
        ("  2.4 Existing Process Analysis: Technical Inefficiencies", "10"),
        ("  2.5 Existing Solutions: Limitations of Generic Platforms", "11"),
        ("  2.6 Technologies Studied: Code Repositories & Matching Systems", "12"),
        ("  2.7 Research Gap: The Need for Practical Skill Bridges", "13"),
        ("  2.8 Challenges Identified", "14"),
        ("CHAPTER 3: PROPOSED SOLUTION", "15"),
        ("  3.1 Solution Overview: The Skill Bridge Technical Framework", "15"),
        ("  3.2 System Architecture: Dual-Desk Operational Architecture", "16"),
        ("  3.3 Process Flow Diagram", "17"),
        ("  3.4 Module Description", "18"),
        ("  3.5 Advantages: Transparent Alignment with Industry Standards", "19"),
        ("CHAPTER 4: SYSTEM DESIGN", "20"),
        ("  4.1 System Design Overview", "20"),
        ("  4.2 Use Case Diagram & Technical Actor Analysis", "21"),
        ("  4.3 Workflow Diagram: Circular Ingestion to Skill Remediation", "22"),
        ("  4.4 Module Design Specifications", "23"),
        ("CHAPTER 5: PROJECT IMPLEMENTATION", "24"),
        ("  5.1 Development Methodology: Iterative Prototyping Across Visits", "24"),
        ("  5.2 Module-wise Implementation", "25"),
        ("  5.3 User Interface Solution: High-Contrast Technical Ergonomics", "26"),
        ("  5.4 Screenshots of Developed Solution", "27"),
        ("CHAPTER 6: TESTING AND VALIDATION", "28"),
        ("  6.1 Test Scenarios: Technical Evaluation Tasks", "28"),
        ("  6.2 Test Results Across Field Visits", "29"),
        ("  6.3 User Acceptance Testing at Khalsa College", "30"),
        ("  6.4 Technical Stakeholder Feedback & Refinements", "31"),
        ("  6.5 Performance & Operational Benchmarking", "32"),
        ("CHAPTER 7: RESULTS AND IMPACT ASSESSMENT", "33"),
        ("  7.1 Deliverables Submitted", "33"),
        ("  7.2 Results Achieved", "34"),
        ("  7.3 Impact on Technical Competence & Placement Readiness", "35"),
        ("  7.4 SDG Contribution", "36"),
        ("CHAPTER 8: CONCLUSION AND FUTURE SCOPE", "37"),
        ("  8.1 Conclusion", "37"),
        ("  8.2 Key Findings: Technical Realities from the Field", "38"),
        ("  8.3 Recommendations for Technical Departments", "39"),
        ("  8.4 Future Enhancements", "40"),
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

    add_h2(doc, "1.1 Project Background: The Technical Evolution of Tech Recruiting")
    add_para(doc, "Over the past five years, the global software engineering recruitment paradigm has undergone a profound transformation. The era when undergraduate engineering and IT students could secure technology careers primarily through memorization of standard arithmetic shortcuts and basic verbal grammar has effectively ended. Contemporary technical recruiters—spanning multinational software enterprises, mid-tier product firms, and fast-growing startups—now demand demonstrable, day-one engineering capabilities.")
    add_para(doc, "Today's campus recruitment screening pipelines are rigorously automated. Candidates must pass unproctored online coding assessments hosted on platforms such as HackerRank, CodeSignal, or LeetCode, where they are tested on Data Structures and Algorithms (time/space complexity, hash maps, binary trees, dynamic programming) under strict 60- to 90-minute timers. Candidates who advance are subjected to live machine coding rounds and technical architecture interviews requiring familiarity with RESTful APIs, Git version control, relational databases, and modern front-end/back-end frameworks.")
    add_para(doc, "Despite this structural shift, our field engagement revealed that collegiate training programs remain almost exclusively tethered to generic paper-and-pencil quantitative aptitude. When my team and I initiated this Community Engagement Project at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, my core motivation as an IT student was to examine this technical chasm. We sought to understand why talented student programmers struggle in placement tests, audit the latency in circular broadcasting, and design a community platform that bridges academic coursework with real-world technical expectations.")

    add_h2(doc, "1.2 Problem Statement")
    add_para(doc, "Undergraduate technology students suffer from substantial placement failure and interview underperformance due to an acute misalignment between collegiate pre-placement training and corporate technical evaluations, compounded by opaque shortlisting that conceals skill deficits and delayed circular dissemination that compresses preparation windows.")
    add_para(doc, "The technical dimensions of this problem can be synthesized into four distinct barriers:")
    add_bullet(doc, "Assessment Window Compression", "Coding test links distributed via disorganized chat forwards trail recruiter emails by an average of 36 hours, leaving students with fewer than 12 hours of notice to review algorithms or configure testing environments.")
    add_bullet(doc, "The Aptitude Training Illusion", "Colleges outsource training to third-party vendors focused on high school arithmetic, completely neglecting practical Data Structures & Algorithms (DSA), machine coding, and framework design.")
    add_bullet(doc, "Opaque Gatekeeping & Portfolio Discounting", "Placement circulars filter applicants strictly via percentage cutoffs, giving zero visibility or credit to students with verified GitHub repositories, deployed applications, or competitive coding profiles.")
    add_bullet(doc, "Absence of Closed-Loop Skill Remediation", "When a student fails a technical screening, no mechanism informs them which specific competencies were lacking, leaving them unable to direct their self-study.")

    add_h2(doc, "1.3 Need for the Project: Curricular Disconnect & Employability")
    add_para(doc, "National employability reports consistently highlight that fewer than 20% of Indian engineering graduates are directly employable in software roles without extensive post-hiring training. This statistic does not reflect an inherent lack of student intelligence, but rather a catastrophic curricular disconnect. University syllabi are revised over multi-year cycles, whereas web frameworks, cloud primitives, and containerization evolve continually.")
    add_para(doc, "There is a pressing need for a community-driven technical intervention that continuously tracks recruiter requirements, maps them against student competencies, and provides targeted, hands-on weekend workshops. By transforming placement preparation from passive lectures into active coding clinics, colleges can elevate their actual graduate employability.")

    add_h2(doc, "1.4 Objectives")
    add_h3(doc, "Primary Objectives")
    add_bullet(doc, "Technical Field Audit", "Conduct three comprehensive on-site community visits to Guru Nanak Khalsa College, Matunga, auditing technical lab infrastructure, coding assessment readiness, and circular latency.")
    add_bullet(doc, "Primary Survey Execution", "Manually distribute and supervise a 12-question Google Form survey across 200 enrolled students in Computer Science, Information Technology, and Data Science cohorts.")
    add_bullet(doc, "Develop 'Skill Bridge' Technical Framework", "Engineer an explainable skill-matching engine and practical workshop management system.")
    add_bullet(doc, "Hands-On Prototype Testing", "Validate platform workflows with student coders in campus computing laboratories across standardized technical tasks.")

    add_h3(doc, "Secondary Objectives")
    add_bullet(doc, "Itemized Skill Breakdown", "Replace arbitrary black-box scores with explicit lists of matching and missing programming languages, frameworks, and databases.")
    add_bullet(doc, "Practical Workshop Catalog", "Establish departmental clinic tracks (DSA Optimization, Full-Stack Web Development, Cloud DevOps) with real-time seat tracking.")
    add_bullet(doc, "Retaliation-Free Feedback", "Provide an anonymous channel for reporting technical test glitches and administrative delays.")

    add_h2(doc, "1.5 Scope of Technical Investigation")
    add_para(doc, "The study focuses specifically on undergraduate students in Computer Science, Information Technology, and Data Science cohorts confronting technical screening rounds for software engineering, full-stack development, and data analyst roles.")

    add_h2(doc, "1.6 SDG Alignment")
    add_bullet(doc, "SDG 4: Quality Education (Target 4.4)", "Directly bridges technical skill deficits through hands-on practical clinics in Data Structures, Full-Stack Web Development, and Cloud infrastructure.")
    add_bullet(doc, "SDG 8: Decent Work and Economic Growth (Target 8.6)", "Equips youth with high-value technical competencies, ensuring successful entry into productive technology employment.")
    add_bullet(doc, "SDG 10: Reduced Inequalities (Target 10.3)", "Removes arbitrary academic barriers and promotes merit-based hiring through transparent skill matching and portfolio recognition.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW
    # =========================================================================
    add_h1(doc, "CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW")

    add_h2(doc, "2.1 Methodology Adopted: Laboratory Audits & Technical Focus Groups")
    add_para(doc, "Our requirement elicitation adopted a technical, investigative field approach conducted across three visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga:")
    add_bullet(doc, "Visit 1 (12 September 2026): Technical Assessment Audit & Survey Rollout", "We engaged 48 final-year CS and IT students in the computing labs. I audited department announcement boards against actual online test windows and launched our 12-question Google Form survey.")
    add_bullet(doc, "Visit 2 (19 September 2026): Lab Walkthroughs & Prototype Usability", "Tested the early Skill Bridge prototype with 32 students in CCF Lab 3, focusing on filtering technical stacks and evaluating skill match scores.")
    add_bullet(doc, "Visit 3 (26 September 2026): Joint Evaluation & Faculty Handover", "Demonstrated our refined itemized matching engine to 40 students and placement coordinators in Seminar Hall 2.")

    add_h2(doc, "2.2 Stakeholder Interactions: Coders, Coordinators & Lab Staff")
    add_para(doc, "Interactions with student programmers and faculty highlighted stark technical realities:")
    add_bullet(doc, "Student Coder Testimonies", "Students explained that aptitude classes teach simple profit-and-loss math, but company assessments ask them to implement Breadth-First Search (BFS) or invert a binary tree on HackerRank.")
    add_bullet(doc, "Placement Coordinator Insights", "Faculty coordinators explained that recruiters frequently express frustration over candidates who have high CGPAs but cannot write clean, error-free code or explain basic Git commands.")
    add_bullet(doc, "Laboratory Assistants", "Lab staff noted that students rarely use lab hours for open-source exploration because the syllabus demands compliance with outdated legacy IDEs.")

    add_h2(doc, "2.3 Domain Overview: The Architecture of Technical Screening")
    add_para(doc, "Modern software recruitment involves automated code evaluation environments. Code submissions are judged not merely on correctness, but on time complexity (Big-O), memory allocation, and edge-case resilience. A candidate unfamiliar with optimized data structures inevitably fails time limits.")

    add_h2(doc, "2.4 Existing Process Analysis: Technical Inefficiencies")
    add_para(doc, "Job descriptions arrive as unformatted PDFs. Coordinators manually summarize them into text messages, stripping crucial tech stack nuances. Candidates have no way to programmatically check if their GitHub stack matches the circular.")

    add_h2(doc, "2.5 Existing Solutions: Limitations of Generic Platforms")
    add_para(doc, "Commercial job portals do not evaluate candidate skills against specific institutional recruitment drives. Automated resume parsers frequently reject candidates based on keyword formatting rather than verified coding capability.")

    add_h2(doc, "2.6 Technologies Studied: Code Repositories & Matching Systems")
    add_para(doc, "We analyzed how rule-based skill comparison algorithms can evaluate candidate competencies against job circular requirements deterministically, avoiding black-box machine learning models that generate unexplainable scores.")

    add_h2(doc, "2.7 Research Gap: The Need for Practical Skill Bridges")
    add_para(doc, "Prior literature discusses software engineering education in the abstract, but fails to address the operational micro-mechanisms needed to link identified coding deficits directly with institutional weekend workshops.")

    add_h2(doc, "2.8 Challenges Identified")
    add_para(doc, "The technical bottlenecks identified during our field research are summarized in the table below:")

    headers_gau = ["Technical Challenge", "Field Observation at Khalsa College", "Impact on Candidate Outcomes"]
    data_gau = [
        ["Notice Latency", "Notice lag averaging 36 hours; circulars forwarded informally.", "Compressed preparation windows (<12h) for intensive coding rounds."],
        ["Skill Omission", "Job circulars lack itemized technology stack requirements.", "Students apply blindly without knowing required frameworks."],
        ["Aptitude Mismatch", "82% report college aptitude classes ignore DSA and machine coding.", "Immediate elimination during initial online assessment tests."],
        ["Rigid Screening", "Blunt CGPA cutoffs disqualify skilled GitHub contributors.", "Demoralization of practical developers with lower semester marks."]
    ]
    create_table(doc, headers_gau, data_gau)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 3: PROPOSED SOLUTION
    # =========================================================================
    add_h1(doc, "CHAPTER 3: PROPOSED SOLUTION")

    add_h2(doc, "3.1 Solution Overview: The Skill Bridge Technical Framework")
    add_para(doc, "'Skill Bridge' is engineered as a robust collegiate platform that aligns student competencies directly with corporate technical expectations. It eliminates chaotic chat forwards, enforces transparent skill matching, and provides direct access to hands-on practical clinics.")
    add_para(doc, "The solution is structured upon four technical pillars:")
    add_bullet(doc, "Centralized Technical Circular Ingestion", "Coordinators input verified tech stack tags (languages, frameworks, databases, tools) and test deadlines.")
    add_bullet(doc, "Deterministic Rule-Based Matching", "Computes compatibility scores transparently, detailing matched and missing competencies.")
    add_bullet(doc, "Practical Workshop Clinic Module", "Manages focused weekend coding clinics with real-time seat availability counters.")
    add_bullet(doc, "Confidential Feedback & Grievance Pipeline", "Enables safe reporting of test platform glitches with anonymous ticket tokens.")

    add_h2(doc, "3.2 System Architecture: Dual-Desk Operational Architecture")
    add_para(doc, "The architectural framework comprises three functional tiers:")
    add_para(doc, "1. Front-End Interaction Tier: Delivers responsive, low-latency interfaces tailored for mobile and desktop screens with color-coded deadline countdown indicators.\n"
             "2. Matching & Business Logic Tier: Executes deterministic set-overlap matching between candidate skill arrays and circular requirements.\n"
             "3. Relational Storage Tier: Manages structured tables for candidate profiles, circulars, workshop quotas, and anonymized grievance tokens.")

    add_h2(doc, "3.3 Process Flow Diagram")
    add_para(doc, "The technical workflow from circular posting to workshop enrollment is shown in the diagram below:")

    add_callout_box(
        doc,
        "Figure 3.1: Technical Architecture & Skill-Matching Workflow of Skill Bridge",
        "Workflow diagram illustrating the end-to-end technical data flow from coordinator circular ingestion, candidate skill array comparison, deterministic match generation, and workshop quota synchronization.",
        placeholder="(add picture)"
    )

    add_h2(doc, "3.4 Module Description")
    add_bullet(doc, "Candidate Technical Profile Module", "Maintains branch, percentage, backlogs, technical skill tags (e.g. Java, Python, React, SQL), and portfolio links.")
    add_bullet(doc, "Transparent Matching Engine", "Calculates percentage compatibility and generates explicit plain-English rationale breakdowns.")
    add_bullet(doc, "Technical Circular Desk", "Displays active circulars with high-visibility countdown timers for impending assessment deadlines.")
    add_bullet(doc, "Hands-on Workshop Clinic Catalog", "Facilitates single-click enrollment into intensive practical clinics with automatic capacity control.")
    add_bullet(doc, "Anonymous Grievance & Guidance Module", "Allows students to report assessment glitches and request 1-on-1 career guidance safely.")

    add_h2(doc, "3.5 Advantages: Transparent Alignment with Industry Standards")
    add_para(doc, "Skill Bridge replaces uninformative rejections with educational feedback. Candidates discover exactly which frameworks they lack and can immediately reserve a seat in a relevant practical workshop clinic.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1(doc, "CHAPTER 4: SYSTEM DESIGN")

    add_h2(doc, "4.1 System Design Overview")
    add_para(doc, "The system design emphasizes determinism, transparency, and operational reliability. It eliminates hidden algorithmic biases, ensuring that every score can be audited by students and faculty alike.")

    add_h2(doc, "4.2 Use Case Diagram & Technical Actor Analysis")
    add_para(doc, "The use case model outlines interactions between Students, Placement Coordinators, and Administrators:")

    add_callout_box(
        doc,
        "Figure 4.1: Technical Use Case Diagram of Skill Bridge",
        "UML Use Case diagram detailing candidate interactions with skill profiles, circular matching, clinic registration, and coordinator review queues.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.3 Workflow Diagram: Circular Ingestion to Skill Remediation")
    add_para(doc, "The operational workflow models state transitions across opportunity discovery, matching, workshop booking, and feedback tracking:")

    add_callout_box(
        doc,
        "Figure 4.2: Comprehensive Operational Workflow Diagram",
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

    add_h2(doc, "5.1 Development Methodology: Iterative Prototyping Across Visits")
    add_para(doc, "Development followed an iterative Agile model informed by our three field visits to Khalsa College:")
    add_bullet(doc, "Sprint 1 (Post-Visit 1)", "Constructed the core dual-desk framework, candidate profile editor, and preliminary circular board.")
    add_bullet(doc, "Sprint 2 (Post-Visit 2)", "Overhauled the matching presentation based on student feedback, replacing bare percentages with an itemized skill breakdown ('Matched: React, Node.js; Missing: Docker'), increasing mobile button targets to 44px, and adding urgent 24h deadline badges.")
    add_bullet(doc, "Sprint 3 (Post-Visit 3)", "Finalized coordinator candidate review feedback trails and workshop attendance auditing rosters.")

    add_h2(doc, "5.2 Module-wise Implementation")
    add_bullet(doc, "Student Workspace", "Displays candidate profile parameters, personalized circulars, skill match scores, and enrolled workshops.")
    add_bullet(doc, "Coordinator Command Desk", "Provides real-time operational KPI metric cards and candidate review queues with direct feedback entry.")
    add_bullet(doc, "Deterministic Matching Engine", "Evaluates academic criteria and normalized skill overlap ratios to produce explainable match rationales.")
    add_bullet(doc, "Anonymous Feedback Pipeline", "Generates ticket tokens (e.g. TKT-5912) and delivers student concerns to coordinator resolution queues with complete identity protection.")

    add_h2(doc, "5.3 User Interface Solution: High-Contrast Technical Ergonomics")
    add_para(doc, "The interface utilizes high-contrast color coding to instantly signal drive urgency (Red: Closing in 24 hours; Amber: 3 days remaining; Green: Open) and clear typographic hierarchy for easy readability.")

    add_h2(doc, "5.4 Screenshots of Developed Solution")
    add_para(doc, "Visual screens of the developed platform are documented in the placeholders below:")

    add_callout_box(
        doc,
        "Figure 5.1: Student Workspace & Itemized Skill Match Breakdown",
        "Screenshot showing candidate academic parameters, opportunity circulars, and the plain-English matched vs missing technical skill breakdown.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.2: Placement Coordinator Candidate Review Desk",
        "Screenshot showing the coordinator interface for reviewing applications by department, updating selection stages, and dispatching constructive feedback.",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Figure 5.3: Workshop Clinic Catalog & Single-Click Reservation",
        "Screenshot showing the practical workshop catalog, syllabus preview, real-time seat availability counter, and one-click enrollment confirmation.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 6: TESTING AND VALIDATION
    # =========================================================================
    add_h1(doc, "CHAPTER 6: TESTING AND VALIDATION")

    add_h2(doc, "6.1 Test Scenarios: Technical Evaluation Tasks")
    add_para(doc, "During Visits 2 and 3 at Khalsa College, we tested four core technical scenarios with student programmers:")
    add_bullet(doc, "Scenario TSK-01 (Stack Filtering)", "Filter circulars for specific roles (Full-Stack Engineer, Cloud Developer) across CS and IT domains.")
    add_bullet(doc, "Scenario TSK-02 (Match Evaluation)", "Examine a circular to understand why a specific match score was awarded based on skill overlap.")
    add_bullet(doc, "Scenario TSK-03 (Clinic Reservation)", "Browse the workshop catalog and reserve a seat in the Advanced DSA & Coding Clinic.")
    add_bullet(doc, "Scenario TSK-04 (Grievance Reporting)", "Submit an anonymous grievance regarding a 12-hour assessment notice and record the tracking ticket.")

    add_h2(doc, "6.2 Test Results Across Field Visits")
    add_para(doc, "Usability metrics recorded across our visits demonstrate marked efficiency gains following iterative refinement:")

    headers_test_g = ["Technical Scenario", "Visit 2 Success", "Visit 2 Observations", "Visit 3 Success", "Visit 3 Observations"]
    data_test_g = [
        ["TSK-01: Stack Filtering", "93.8% (30/32)", "Fast, but requested explicit remote tags.", "100.0% (40/40)", "Seamless and intuitive."],
        ["TSK-02: Skill Breakdown", "81.3% (26/32)", "Confusion on bare percentage numbers.", "97.5% (39/40)", "Itemized lists resolved all doubts."],
        ["TSK-03: Clinic Reservation", "100.0% (32/32)", "Instant reservation; great feedback.", "100.0% (40/40)", "Instant seat confirmation."],
        ["TSK-04: Anonymous Grievance", "90.6% (29/32)", "Students verified if roll no was hidden.", "97.5% (39/40)", "Reassurance from Ticket ID tokens."],
        ["Cumulative Average", "87.5%", "Friction on match scores and mobile pills.", "97.5%", "High student satisfaction and trust."]
    ]
    create_table(doc, headers_test_g, data_test_g)

    add_h2(doc, "6.3 User Acceptance Testing at Khalsa College")
    add_para(doc, "User Acceptance Testing conducted in Seminar Hall 2 during Visit 3 demonstrated overwhelming student and faculty endorsement. Coordinators confirmed that the centralized circular board and transparent criteria would drastically reduce duplicate student inquiries.")

    add_h2(doc, "6.4 Technical Stakeholder Feedback & Refinements")
    add_bullet(doc, "Itemized Skill Reasons", "Replaced numeric match scores with explicit lists of matching and missing skills ('Matched: Python, SQL; Missing: Docker').")
    add_bullet(doc, "Urgent Deadline Indicators", "Introduced high-visibility countdown badges ('Closing in 14h') to alert candidates to impending deadlines.")

    add_h2(doc, "6.5 Performance & Operational Benchmarking")
    add_para(doc, "Skill Bridge replaces an average notice delay of 36 hours with instant digital circular distribution. Workshop seat reservations execute in under 2 seconds, eliminating spreadsheet overwrites.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 7: RESULTS AND IMPACT ASSESSMENT
    # =========================================================================
    add_h1(doc, "CHAPTER 7: RESULTS AND IMPACT ASSESSMENT")

    add_h2(doc, "7.1 Deliverables Submitted")
    add_bullet(doc, "Skill Bridge Web Portal", "Fully implemented dual-desk platform for students and coordinators.")
    add_bullet(doc, "Survey Dataset (200 Students)", "Empirical survey database capturing technical placement perceptions across CS, IT, and DS cohorts.")
    add_bullet(doc, "6-Dimension Action Roadmap", "Actionable institutional roadmap for curriculum alignment and practical clinics.")
    add_bullet(doc, "Academic Project Documentation", "Comprehensive reports detailing field methodologies, technical architectures, and findings.")

    add_h2(doc, "7.2 Results Achieved")
    add_bullet(doc, "Quantified Technical Training Gaps", "Proved that 82% of students feel college aptitude training fails to prepare them for live coding rounds.")
    add_bullet(doc, "Validated 97.5% Usability Success", "Demonstrated that explainable matching and clear visual cues eliminate user error.")
    add_bullet(doc, "Institutional Endorsement", "Secured positive reviews from Khalsa College placement coordinators.")

    add_h2(doc, "7.3 Impact on Technical Competence & Placement Readiness")
    add_para(doc, "Skill Bridge replaces passive anxiety with structured preparation. Candidates understand exactly which skills they lack and can immediately enroll in targeted weekend workshops to bridge those deficits.")

    add_h2(doc, "7.4 SDG Contribution")
    add_para(doc, "Advances UN SDG 4 (Quality Education) through practical coding clinics, SDG 8 (Decent Work) by elevating technical employability, and SDG 10 (Reduced Inequalities) by providing transparent, merit-based career access.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    add_h1(doc, "CHAPTER 8: CONCLUSION AND FUTURE SCOPE")

    add_h2(doc, "8.1 Conclusion")
    add_para(doc, "Technical education must align with real-world industry demands. Our field engagement at Guru Nanak Khalsa College, Matunga, confirmed that undergraduate placement distress stems from an acute technical divide: students are trained in pen-and-paper aptitude while recruiters test live machine coding and modern frameworks.")
    add_para(doc, "Through 200 primary survey responses and 3 field visits, we proved that collegiate placements require an explainable, practical technical bridge. 'Skill Bridge' successfully delivers this intervention, establishing transparent skill matching, practical clinic management, and safe grievance channels.")

    add_h2(doc, "8.2 Key Findings: Technical Realities from the Field")
    add_bullet(doc, "Failure of Aptitude Training", "82% of students report that vendor aptitude classes do not prepare them for technical coding assessments.")
    add_bullet(doc, "Assessment Window Compression", "Informal message forwards delay circulars by an average of 36 hours, compressing test preparation.")
    add_bullet(doc, "Demand for Explainable Matching", "Candidates demand itemized breakdowns of missing technical competencies to guide their self-study.")

    add_h2(doc, "8.3 Recommendations for Technical Departments")
    add_bullet(doc, "Integrate Machine Coding Clinics", "Mandate weekly hands-on coding clinics in Data Structures, modern frameworks, and Git.")
    add_bullet(doc, "Adopt Real-Time Digital Circulars", "Transition from WhatsApp forwards to an authoritative digital board with push notifications.")
    add_bullet(doc, "Mandate Tech Stack Transparency", "Require visiting companies to list explicit framework requirements rather than blunt CGPA cutoffs.")

    add_h2(doc, "8.4 Future Enhancements")
    add_bullet(doc, "Integrated In-Browser Code Sandboxes", "Allow students to practice company-specific coding questions directly within the portal.")
    add_bullet(doc, "Automated GitHub Stack Parsing", "Enable students to connect their GitHub accounts to automatically verify their technical skill badges.")
    add_bullet(doc, "Alumni Mock Coding Desks", "Connect students with working alumni for realistic mock technical interviews.")

    add_page_break(doc)

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1(doc, "REFERENCES (MLA FORMAT)")

    refs = [
        "All India Council for Technical Education (AICTE). Model Curriculum for Undergraduate Degree Courses in Engineering & Technology. AICTE Publications, New Delhi, 2022.",
        "Aspiring Minds. National Employability Report: Engineers 2019. Aspiring Minds Research Cell, Gurugram, 2019.",
        "Cormen, Thomas H., et al. Introduction to Algorithms. 4th ed., MIT Press, Cambridge, 2022.",
        "Guru Nanak Khalsa College of Arts, Science & Commerce. Departmental Placement Circulars, Notice Records, and Laboratory Audit Logs. Matunga, Mumbai, Sept. 2026.",
        "McConnell, Steve. Code Complete: A Practical Handbook of Software Construction. 2nd ed., Microsoft Press, Redmond, 2004.",
        "Pressman, Roger S., and Bruce R. Maxim. Software Engineering: A Practitioner's Approach. 9th ed., McGraw-Hill Education, New York, 2020.",
        "United Nations. The 2030 Agenda for Sustainable Development: Transforming Our World. United Nations Department of Economic and Social Affairs, New York, 2015.",
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
        "Photo A.1: Visit 1 — Technical Assessment Audit & Focus Groups",
        "Gaurav Mhatre, Dhiraj Tendulkar, Vidhi Mahato, and Varun Patil auditing coding assessment announcements and conducting focus groups in the Computing Laboratory at Khalsa College, Matunga (12 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.2: Visit 2 — Interactive Usability Walkthrough in Central Computing Lab",
        "Students executing hands-on scenario testing of the Skill Bridge prototype on desktop terminals in CCF Lab 3 while Gaurav Mhatre logs task completion times and interface suggestions (19 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.3: Visit 3 — Joint Evaluation & Action Plan Handover in Seminar Hall",
        "Final presentation and evaluation session in Seminar Hall 2 with student representatives and faculty placement coordinators, presenting the refined itemized skill matching breakdown and action plan (26 September 2026).",
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
    add_para(doc, "Technical interview prompts utilized during student and faculty focus groups across Visits 1, 2, and 3:")
    add_bullet(doc, "Technical Assessment Prompt 1", "When taking online coding tests on HackerRank or LeetCode, what specific data structures or algorithmic patterns cause the greatest difficulty?")
    add_bullet(doc, "Technical Assessment Prompt 2", "How do college-sponsored aptitude classes compare to the actual machine coding rounds you face during recruitment drives?")
    add_bullet(doc, "Technical Assessment Prompt 3", "If a job listing requires Docker and React, but the college syllabus only covers basic HTML/PHP, how do you bridge that gap?")
    add_bullet(doc, "Coordinator Prompt 1", "What feedback do corporate technical interviewers provide regarding candidate coding performance?")
    add_bullet(doc, "Coordinator Prompt 2", "How can the department organize practical workshops that directly address recruiter requirements?")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE D: REPORTING OFFICER / MENTOR FEEDBACK FORM")
    add_para(doc, "Blank evaluation form for Industry / Field Reporting Officer at Guru Nanak Khalsa College and Faculty Mentor at VSIT:")

    add_callout_box(
        doc,
        "Annexure D: Field Reporting Officer & Mentor Evaluation Sheet",
        "Official institutional evaluation sheet recording marks for technical assessment rigor, community rapport, workshop design quality, and final report thoroughness.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE E: SOURCE CODE REPOSITORY LINK & PROJECT CONTENTS")
    add_para(doc, "Source code archive and project repository:")
    add_bullet(doc, "Repository URL", "https://github.com/dhiraj-tendulkar/skill-bridge-cep-portal (Local workspace: D:\\CEP website)")
    add_bullet(doc, "Repository Contents", "Complete web portal codebase, SQLite database migration scripts, empirical survey seeds, and full documentation suite.")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE F: USER MANUAL & WORKFLOW GUIDE")
    add_para(doc, "User guide for students and placement coordinators focusing on technical matching and workshop enrollment:")
    add_bullet(doc, "Student Instructions", "1. Open the portal; 2. Configure branch and technical skills in your profile; 3. Browse active circulars; 4. Review matched and missing skills; 5. Enroll in practical workshop clinics; 6. Submit confidential feedback via the Feedback desk.")
    add_bullet(doc, "Coordinator Instructions", "1. Log into the Command Desk; 2. Create vacancies with required technical skill tags; 3. Review candidate lists with feedback; 4. Mark clinic attendance; 5. Review and resolve student grievances anonymously.")

    out_path = os.path.join(os.getcwd(), "CEP_Documentation_Gaurav_Mhatre_24302A0067.docx")
    doc.save(out_path)
    print(f"Gaurav Mhatre documentation built successfully: {out_path}")

if __name__ == "__main__":
    build_gaurav_documentation()
