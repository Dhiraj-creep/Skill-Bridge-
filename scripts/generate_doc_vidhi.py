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

def build_vidhi_documentation():
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
    r_tit = p_title.add_run("BRIDGING THE CAMPUS CAREER DIVIDE: EMPATHY, SKILL READINESS, AND STUDENT EXPERIENCES IN UNDERGRADUATE PLACEMENTS\n")
    r_tit.font.name = 'Times New Roman'
    r_tit.font.size = Pt(18)
    r_tit.font.bold = True
    r_tit.font.color.rgb = RGBColor(30, 58, 138)
    r_sub = p_title.add_run("A Qualitative and Human-Centric Field Study into Student Psychological Well-Being, Placement Anxieties, and Support Systems across Technology Cohorts\n\n")
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
        "VIDHI MAHATO\n"
        "Roll Number: 24302A0028\n"
        "(Field Interviewer & Student Experience Specialist)\n\n"
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

    add_para(doc, "I hereby certify that Ms. Vidhi Mahato (Roll Number: 24302A0028), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. (Information Technology) Semester V, has completed the Community Engagement Project (CEP) titled \"BRIDGING THE CAMPUS CAREER DIVIDE: EMPATHY, SKILL READINESS, AND STUDENT EXPERIENCES IN UNDERGRADUATE PLACEMENTS\" based on authentic field immersion, in-depth interviews, focus groups, and survey collection conducted at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai, during the academic year 2026-2027.")

    add_para(doc, "The report represents genuine qualitative research, student experience analysis, and human-centered design contributions carried out by the candidate in partial fulfillment of the academic requirements prescribed by the University of Mumbai and Vidyalankar School of Information Technology.")

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
    add_para(doc, "Note: Official signed observation records from our three field visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, and faculty mentor logs are preserved in the appendices of this report.")

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

    add_para(doc, "I, Ms. Vidhi Mahato (Roll Number: 24302A0028), Student of Vidyalankar School of Information Technology, studying in T.Y. B.Sc. in Information Technology, Semester V, hereby declare that I have completed the Community Engagement Project titled \"BRIDGING THE CAMPUS CAREER DIVIDE: EMPATHY, SKILL READINESS, AND STUDENT EXPERIENCES IN UNDERGRADUATE PLACEMENTS\" during the academic year 2026-2027.")

    add_para(doc, "The information, student case studies, emotional perspectives, and survey feedback presented in this report were gathered directly through human-centered interactions, listening circles, personal interviews, and our manual distribution of a 12-question Google Form among 200 undergraduate students across Computer Science, Information Technology, and Data Science cohorts at Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai.")

    add_para(doc, "I declare that this report represents my original qualitative perspective and dedicated analysis of student experiences, and has not been submitted previously for any academic award or qualification.")

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(30)
    p_sig.add_run("Date: 04 October 2026\n"
                  "Place: Mumbai\n\n"
                  "_________________________________________\n"
                  "Signature of the Student: Vidhi Mahato\n"
                  "Roll Number: 24302A0028\n"
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

    add_para(doc, "I express my profound gratitude to Vidyalankar School of Information Technology and the University of Mumbai for introducing the Community Engagement Project. It gave us the rare and transformative opportunity to step away from abstract technical code and look closely at the emotional, psychological, and human realities of our peers.")

    add_para(doc, "I extend my heartfelt thanks to our Faculty Mentor and Project Guide for their continuous support, patience, and encouraging feedback, helping me focus on the qualitative depth and student well-being dimensions of this research.")

    add_para(doc, "I am deeply grateful to the students, faculty members, and placement cell coordinators of Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai. They welcomed us into their classrooms, laboratories, and common areas with exceptional warmth. In particular, I thank the female students and quiet candidates who took me into their confidence, sharing their fears of rejection, imposter syndrome, and family pressures.")

    add_para(doc, "I also express my deep appreciation to my teammates—Dhiraj Tendulkar, Gaurav Mhatre, and Varun Patil. Working with them across all three days at Khalsa College was an experience of shared empathy, continuous learning, and mutual respect.")

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

    add_para(doc, "Behind every institutional placement brochure and statistical hiring banner lies an individual student confronting acute career anxiety, self-doubt, and administrative helplessness. This Community Engagement Project investigates the human and psychological dimensions of the undergraduate campus recruitment journey across technology programs. The fieldwork was conducted through three dedicated community visits to Guru Nanak Khalsa College of Arts, Science & Commerce in Matunga, Mumbai, supplemented by a primary Google Form survey manually distributed across 200 enrolled students (80 CS, 60 IT, 60 DS).")

    add_para(doc, "Through small-group listening circles and personal interviews, my research focused on capturing the emotional toll of opaque rejection, last-minute message forwards, and the fear of reporting grievances. Our findings demonstrate that 72.5% of students feel their placement needs are unmet or only partly met, with 61% experiencing persistent anxiety due to delayed drive notifications that leave fewer than 12 hours to prepare for assessments. Female students and non-traditional coders reported particularly intense feelings of imposter syndrome when rejected by blunt CGPA thresholds without any explanation of their technical shortcomings. In response, our team developed and tested 'Skill Bridge,' an empathetic community portal. By providing explainable skill-matching breakdowns, single-click practical clinic registration, and a strictly anonymous grievance desk, Skill Bridge eliminates institutional fear and restores student agency. Usability testing across successive visits achieved a 97.5% task success rate, proving that designing placement systems with empathy and transparency significantly enhances student confidence and aligns directly with UN SDG 4 and SDG 8.")

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
        ("  1.1 Project Background: The Human Dimension of Campus Placements", "1"),
        ("  1.2 Problem Statement", "2"),
        ("  1.3 Need for the Project: A Student-Centric Perspective", "3"),
        ("  1.4 Objectives (Primary & Secondary)", "4"),
        ("  1.5 Scope of the Study", "5"),
        ("  1.6 SDG Alignment (SDG 4, 8, 10)", "6"),
        ("CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW", "7"),
        ("  2.1 Methodology Adopted: Listening Circles & Field Visits", "7"),
        ("  2.2 Stakeholder Interactions: Student Voices & Anxieties", "8"),
        ("  2.3 Domain Overview: The Stress Economy of Collegiate Hiring", "9"),
        ("  2.4 Existing Process Analysis: Emotional and Operational Pitfalls", "10"),
        ("  2.5 Existing Solutions: Why Generic Job Portals Alienate Students", "11"),
        ("  2.6 Technologies Studied from a Human Experience Lens", "12"),
        ("  2.7 Research Gap: The Missing Element of Empathy and Clarity", "13"),
        ("  2.8 Challenges Identified", "14"),
        ("CHAPTER 3: PROPOSED SOLUTION", "15"),
        ("  3.1 Solution Overview: The Skill Bridge Framework", "15"),
        ("  3.2 System Architecture: Designing for Emotional Safety & Clarity", "16"),
        ("  3.3 Process Flow Diagram", "17"),
        ("  3.4 Module Description", "18"),
        ("  3.5 Advantages: Restoring Agency and Confidence", "19"),
        ("CHAPTER 4: SYSTEM DESIGN", "20"),
        ("  4.1 System Design Overview", "20"),
        ("  4.2 Use Case Diagram & Student Journey Analysis", "21"),
        ("  4.3 Workflow Diagram: The Compassionate Placement Path", "22"),
        ("  4.4 Module Design Specifications", "23"),
        ("CHAPTER 5: PROJECT IMPLEMENTATION", "24"),
        ("  5.1 Development Methodology: Iterating with Student Feedback", "24"),
        ("  5.2 Module-wise Implementation", "25"),
        ("  5.3 User Interface Solution: Calm, Accessible, and Reassuring", "26"),
        ("  5.4 Screenshots of Developed Solution", "27"),
        ("CHAPTER 6: TESTING AND VALIDATION", "28"),
        ("  6.1 Test Scenarios: Empathy-Focused Usability Tasks", "28"),
        ("  6.2 Test Results Across Field Visits", "29"),
        ("  6.3 User Acceptance Testing at Khalsa College", "30"),
        ("  6.4 Student Feedback & Iterative Refinements", "31"),
        ("  6.5 Performance & Emotional Impact Evaluation", "32"),
        ("CHAPTER 7: RESULTS AND IMPACT ASSESSMENT", "33"),
        ("  7.1 Deliverables Submitted", "33"),
        ("  7.2 Results Achieved", "34"),
        ("  7.3 Impact on Student Mental Well-Being & Community Trust", "35"),
        ("  7.4 SDG Contribution", "36"),
        ("CHAPTER 8: CONCLUSION AND FUTURE SCOPE", "37"),
        ("  8.1 Conclusion", "37"),
        ("  8.2 Key Findings: What Students Truly Need", "38"),
        ("  8.3 Recommendations for Collegiate Placement Offices", "39"),
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

    add_h2(doc, "1.1 Project Background: The Human Dimension of Campus Placements")
    add_para(doc, "Discussions surrounding college campus placements are almost exclusively conducted through the cold language of numbers: placement percentages, average salary packages, and lists of corporate recruiters. Yet behind these institutional metrics lies a vibrant, vulnerable community of undergraduate students navigating what is often the most stressful and uncertain period of their young lives. In technical education, final-year students are expected to simultaneously balance grueling semester coursework, university examinations, major final-year projects, and corporate recruitment drives.")
    add_para(doc, "As an undergraduate student in Information Technology, I watched peers who were brilliant coders, creative problem-solvers, and diligent learners break down in tears outside examination halls. Their distress was rarely caused by an unwillingness to work hard; rather, it was caused by an opaque, chaotic system that left them feeling powerless. A message would arrive on an informal WhatsApp group late at night announcing a technical coding test scheduled for the next morning. Students would scramble, miss the test due to an unread notification, and then face the crushing assumption that they were simply not good enough.")
    add_para(doc, "When our team initiated this Community Engagement Project, I made a personal commitment to place the lived human experience at the core of our research. Partnering with Guru Nanak Khalsa College of Arts, Science & Commerce in Matunga, Mumbai, we set out to understand the human face of placement disparities. We wanted to listen to the quiet frustrations, document the emotional hurdles of rejection, and build a system that treats students not as passive data points on an administrative spreadsheet, but as human beings striving for a dignified career.")

    add_h2(doc, "1.2 Problem Statement")
    add_para(doc, "Undergraduate technology students face intense career distress and placement friction resulting from erratic communication channels, opaque shortlisting criteria that induce imposter syndrome, generalized training that fails to build real competence, and a pervasive institutional fear that prevents students from seeking help or reporting grievances.")
    add_para(doc, "From a student-centric perspective, this overarching problem manifests in four acute ways:")
    add_bullet(doc, "Anxiety Induced by Communication Chaos", "Drive notifications and test links forwarded through informal chat groups frequently arrive with less than 12 hours of warning, plunging students into constant panic and disrupting sleep and study schedules.")
    add_bullet(doc, "The Emotional Trauma of Silent Rejection", "Students receive blunt 'Not Eligible' or 'Rejected' notices without a single word of explanation regarding which technical skills they lacked, causing capable individuals to lose confidence in their self-worth.")
    add_bullet(doc, "Disconnection Between Effort and Outcome", "Students spend hundreds of hours attending college-mandated general aptitude lectures, only to discover in technical interviews that corporate interviewers evaluate modern frameworks (React, Node, Cloud) and live coding—skills never covered in standard sessions.")
    add_bullet(doc, "Institutional Silence and Fear of Debarment", "Students who experience technical glitches during online tests or scheduling clashes with semester practical exams suffer in silence because approaching faculty coordinators risks being labeled 'troublemakers' and blacklisted from campus drives.")

    add_h2(doc, "1.3 Need for the Project: A Student-Centric Perspective")
    add_para(doc, "There is an urgent need for an empathetic re-engineering of the collegiate placement model. When students experience repeated opaque rejections without actionable feedback, they develop chronic self-doubt and career fatalism. In Mumbai's competitive environment, where many students are first-generation college goers bearing the aspirations of their families, placement failure can trigger severe depression and family stress.")
    add_para(doc, "By introducing transparency, explainable feedback, and anonymous communication channels, an institution transforms its culture from punitive gatekeeping to collaborative mentorship. When a student understands exactly why they did not match a job circular and is immediately given a seat in a practical workshop to learn that missing skill, anxiety transforms into constructive learning.")

    add_h2(doc, "1.4 Objectives")
    add_h3(doc, "Primary Objectives")
    add_bullet(doc, "Empathetic Listening and Qualitative Discovery", "Conduct qualitative listening circles and focus groups across three community visits at Guru Nanak Khalsa College, Matunga, documenting the lived experiences of students.")
    add_bullet(doc, "Extensive Student Surveying", "Manually distribute and assist in the completion of a 12-question Google Form survey across 200 undergraduate students in Computer Science, Information Technology, and Data Science.")
    add_bullet(doc, "Human-Centered Solution Formulation", "Co-design 'Skill Bridge,' ensuring its workflows prioritize clarity, reassurance, and emotional safety.")
    add_bullet(doc, "Iterative Usability Validation", "Walk students through prototype tasks in campus laboratories, observing body language, hesitations, and relief to refine user journeys.")

    add_h3(doc, "Secondary Objectives")
    add_bullet(doc, "Demystifying Rejection", "Implement explainable skill-matching breakdowns so students receive clear educational reasons rather than arbitrary numeric rejections.")
    add_bullet(doc, "Eliminating Fear Through True Anonymity", "Create a protected grievance desk that guarantees complete identity shielding, allowing students to report issues safely.")
    add_bullet(doc, "Institutional Action Roadmap", "Deliver a practical 6-dimension student empowerment roadmap to Khalsa College faculty and student leaders.")

    add_h2(doc, "1.5 Scope of the Study")
    add_para(doc, "The scope focuses on third- and fourth-year undergraduate technical students (CS, IT, and DS) navigating campus recruitment drives at Guru Nanak Khalsa College, Matunga. It addresses the emotional and operational journey of job discovery, skill evaluation, training participation, and administrative grievance reporting.")

    add_h2(doc, "1.6 SDG Alignment")
    add_para(doc, "The project directly champions three vital United Nations Sustainable Development Goals:")
    add_bullet(doc, "SDG 4: Quality Education (Target 4.4)", "Fosters inclusive, practical skill acquisition through hands-on technical clinics that build genuine employability.")
    add_bullet(doc, "SDG 8: Decent Work and Economic Growth (Target 8.6)", "Reduces youth unemployment by transforming passive applicants into confident, industry-ready professionals.")
    add_bullet(doc, "SDG 10: Reduced Inequalities (Target 10.2)", "Ensures that students from underprivileged backgrounds or those with non-traditional academic trajectories receive equal, transparent career opportunities without institutional bias.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW
    # =========================================================================
    add_h1(doc, "CHAPTER 2: REQUIREMENT ANALYSIS AND LITERATURE REVIEW")

    add_h2(doc, "2.1 Methodology Adopted: Listening Circles & Field Visits")
    add_para(doc, "Our requirement gathering methodology was deliberately designed to be conversational, respectful, and observant. As Field Interviewer, I recognized that if we approached students with formal clipboards and clinical authority, they would provide rehearsed, polite answers. Instead, we sat with students in their computing labs during breaks, in library corridors, and under the campus quadrangle trees.")
    add_para(doc, "Our three community visits at Guru Nanak Khalsa College unfolded in progressive depth:")
    add_bullet(doc, "Visit 1 (12 September 2026): Building Trust & Survey Rollout", "We facilitated listening circles with 48 CS and IT students. I focused on drawing out quieter students and young women who often remain silent in large departmental meetings. We concurrently launched our 12-question Google Form survey, personally guiding students through the questions.")
    add_bullet(doc, "Visit 2 (19 September 2026): Prototype Usability Walkthroughs", "We observed 32 students interacting with our early prototype in Computing Lab 3. I monitored their micro-expressions—noticing furrowed brows when a screen was confusing and audible sighs of relief when an anonymous ticket ID was generated.")
    add_bullet(doc, "Visit 3 (26 September 2026): Joint Evaluation & Empowerment Handover", "We demonstrated our refined system to 40 students and faculty coordinators in Seminar Hall 2, verifying that their feedback had transformed the platform into a welcoming, transparent reality.")

    add_h2(doc, "2.2 Stakeholder Interactions: Student Voices & Anxieties")
    add_para(doc, "During our listening circles, three profound themes emerged consistently:")
    add_bullet(doc, "The Agony of the 'Silent Whatsapp Drop'", "Students described checking their phones compulsively throughout the day. A missed message meant an expired registration link. One female IT student shared: 'I was traveling on the local train with poor connectivity when a registration link dropped. By the time I reached home at 8 PM, the Google Form was closed.'")
    add_bullet(doc, "Imposter Syndrome Driven by Percentage Gatekeeping", "Several students who possessed active GitHub portfolios, hackathon trophies, and deployed web apps felt entirely marginalized because their second-year semester marks were around 65%, disqualifying them from even applying.")
    add_bullet(doc, "The Fear of Faculty Confrontation", "When asked why they didn't report unfair test schedules to placement coordinators, students answered unanimously: 'If we complain, our names will be remembered, and we will be debarred from the next company.'")

    add_h2(doc, "2.3 Domain Overview: The Stress Economy of Collegiate Hiring")
    add_para(doc, "Campus recruitment is inherently high-stakes. In contemporary Indian metropolitan colleges, placement outcomes are often treated as the sole benchmark of four years of education. This environment fosters a hyper-competitive 'stress economy' where students view peers as rivals, rumors circulate unchecked, and institutional opacity magnifies panic. Without transparent digital systems, this stress becomes paralyzing.")

    add_h2(doc, "2.4 Existing Process Analysis: Emotional and Operational Pitfalls")
    add_para(doc, "The legacy workflow relied upon fragmented, manual channels: faculty emails to student representatives, forwards across multiple WhatsApp groups, and manual Google Sheets. From an emotional perspective, this workflow created constant insecurity: students had no proof of application submission, no idea when results would be declared, and zero feedback on why they were rejected.")

    add_h2(doc, "2.5 Existing Solutions: Why Generic Job Portals Alienate Students")
    add_para(doc, "Commercial job portals (LinkedIn, Naukri, Internshala) fail because they treat candidates as independent market agents. They do not understand that an undergraduate student operates within an institutional academic calendar, requires college-authorized drive circulars, and needs remediation clinics for identified skill gaps. They offer zero institutional accountability.")

    add_h2(doc, "2.6 Technologies Studied from a Human Experience Lens")
    add_para(doc, "We evaluated existing technologies based on their cognitive impact. Static message boards and Google Forms were found to induce cognitive overload and anxiety due to formatting inconsistencies and lack of automated receipts. We realized that a dedicated web portal with clean visual hierarchy, clear typography, and color-coded urgency badges provides immediate psychological reassurance.")

    add_h2(doc, "2.7 Research Gap: The Missing Element of Empathy and Clarity")
    add_para(doc, "Literature on campus placements predominantly analyzes macroeconomic recruitment trends or algorithmic matching techniques. Almost no published study examines the micro-human experience of placement communication—specifically how explainable feedback and anonymous grievance channels restore student mental well-being and academic confidence.")

    add_h2(doc, "2.8 Challenges Identified")
    add_para(doc, "The following synthesis summarizes the core emotional and operational challenges identified during our field interactions:")

    headers_vid = ["Identified Challenge", "Human Reality Observed", "Emotional & Mental Toll"]
    data_vid = [
        ["Communication Lag", "Notifications buried under casual chat forwards; notice lag averaging 36 hours.", "Chronic sleep deprivation, constant phone checking, and acute panic."],
        ["Opaque Rejections", "Generic rejection emails with no skill explanation or feedback.", "Severe imposter syndrome, feelings of worthlessness, and loss of motivation."],
        ["Aptitude Mismatch", "Generic math formulas taught while recruiters test React, Node, and DSA.", "Helplessness during technical interviews; feeling unprepared despite hard work."],
        ["Fear of Retaliation", "No safe channel to report unfair test timings or technical glitches.", "Complete suppression of student voice; enduring grievances in silence."]
    ]
    create_table(doc, headers_vid, data_vid)

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 3: PROPOSED SOLUTION
    # =========================================================================
    add_h1(doc, "CHAPTER 3: PROPOSED SOLUTION")

    add_h2(doc, "3.1 Solution Overview: The Skill Bridge Framework")
    add_para(doc, "'Skill Bridge' was conceived not merely as an administrative database, but as a supportive digital sanctuary for undergraduate job seekers. Designed to dismantle the opacity of traditional campus recruitment, Skill Bridge establishes an empathetic, transparent contract between students and placement coordinators.")
    add_para(doc, "The solution is guided by four human-centered commitments:")
    add_bullet(doc, "Dignity in Communication", "Every circular is presented with complete clarity—displaying transparent eligibility rules, required technical stacks, and prominent countdown timers.")
    add_bullet(doc, "Constructive, Explainable Matching", "Students are never rejected by a silent algorithm. Compatibility scores are accompanied by clear, constructive lists of matching and missing skills.")
    add_bullet(doc, "Actionable Hope via Skill Clinics", "When a student discovers missing skills, the portal immediately guides them to an upcoming hands-on workshop clinic where they can bridge that gap.")
    add_bullet(doc, "Absolute Protection of Student Voice", "An anonymous grievance desk ensures that students can report administrative delays, scheduling clashes, or unfair criteria without any possibility of personal retribution.")

    add_h2(doc, "3.2 System Architecture: Designing for Emotional Safety & Clarity")
    add_para(doc, "The architectural framework of Skill Bridge reflects our empathy-driven design principles:")
    add_para(doc, "1. The Student Workspace: A private, reassuring dashboard where students maintain their academic profile, explore curated job opportunities, view itemized skill match breakdowns, track active applications, and enroll in practical workshops.\n"
             "2. The Coordinator Command Desk: An efficient, centralized portal allowing faculty coordinators to publish verified circulars, review candidate pools, attach constructive feedback to status updates, audit clinic attendance, and resolve anonymous grievances.\n"
             "3. The Confidential Storage & Matching Layer: Enforces complete cryptographic separation of grievance tickets from personal student records while executing deterministic, transparent matching logic.")

    add_h2(doc, "3.3 Process Flow Diagram")
    add_para(doc, "The empathetic student journey from circular discovery to constructive skill remediation is illustrated in the diagram below:")

    add_callout_box(
        doc,
        "Figure 3.1: Empathetic Student Journey & Feedback Flow in Skill Bridge",
        "Workflow diagram mapping the student experience from job circular discovery, transparent skill gap visualization, immediate practical clinic enrollment, to protected anonymous grievance submission.",
        placeholder="(add picture)"
    )

    add_h2(doc, "3.4 Module Description")
    add_bullet(doc, "Student Profile Empowerment Desk", "Enables students to present their authentic credentials—branch, academic aggregate, backlogs, technical competencies, and GitHub portfolios.")
    add_bullet(doc, "Explainable Skill Matching Engine", "Replaces anxiety-inducing black-box scores with plain-English breakdowns ('Matched: Python, SQL; Missing: Docker; Clinic available: Cloud Deployment').")
    add_bullet(doc, "Verified Circular Board", "Presents authoritative placement notices with high-contrast, color-coded urgency countdown badges.")
    add_bullet(doc, "Practical Skill Clinics Module", "Offers one-click reservation for hands-on weekend technical training clinics with fair capacity quotas.")
    add_bullet(doc, "Safe Grievance & Guidance Desks", "Issues random tracking tokens (e.g. TKT-3491) that shield student identities while allowing coordinators to respond constructively.")

    add_h2(doc, "3.5 Advantages: Restoring Agency and Confidence")
    add_para(doc, "Skill Bridge fundamentally alters the psychological dynamic of campus placements. By providing transparent reasons for rejection and immediate paths to remediation, it replaces panic with actionable agency. By protecting student voices through verified anonymity, it builds a collegiate culture of mutual trust and respect.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 4: SYSTEM DESIGN
    # =========================================================================
    add_h1(doc, "CHAPTER 4: SYSTEM DESIGN")

    add_h2(doc, "4.1 System Design Overview")
    add_para(doc, "System design focused on human factors, cognitive ergonomics, and emotional reassurance. Interfaces were structured to minimize visual friction, ensure high legibility on small mobile displays, and prevent accidental data loss.")

    add_h2(doc, "4.2 Use Case Diagram & Student Journey Analysis")
    add_para(doc, "The use case model captures the interactions between the Student and Coordinator actors, emphasizing feedback loops and safe communication channels:")

    add_callout_box(
        doc,
        "Figure 4.1: Human-Centered Use Case Diagram of Skill Bridge",
        "UML Use Case diagram illustrating student interactions with self-service profiles, explainable matching, clinic booking, and anonymous grievance routing to the coordinator desk.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.3 Workflow Diagram: The Compassionate Placement Path")
    add_para(doc, "The activity workflow ensures that every state transition provides immediate positive reinforcement—such as instant application receipt badges and guaranteed delivery of anonymized feedback tickets.")

    add_callout_box(
        doc,
        "Figure 4.2: Compassionate Placement Workflow Diagram",
        "Activity diagram detailing the sequential flow from circular publication to candidate status updates, feedback dispatch, and closed-loop grievance resolution.",
        placeholder="(add picture)"
    )

    add_h2(doc, "4.4 Module Design Specifications")
    add_para(doc, "Key design specifications include cryptographic stripping of student identification keys from grievance records, real-time workshop seat counters that prevent overbooking, and deterministic skill overlap calculations.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 5: PROJECT IMPLEMENTATION
    # =========================================================================
    add_h1(doc, "CHAPTER 5: PROJECT IMPLEMENTATION")

    add_h2(doc, "5.1 Development Methodology: Iterating with Student Feedback")
    add_para(doc, "Implementation followed a user-centered, iterative Agile model shaped directly by the feedback gathered during our Khalsa College visits. Between each visit, we translated student observations into concrete design refinements:")
    add_bullet(doc, "Iteration 1 (Post-Visit 1)", "Created the initial dual-desk interface with clean layout, student profile fields, and centralized circular broadcasting.")
    add_bullet(doc, "Iteration 2 (Post-Visit 2)", "Overhauled the matching presentation based on student usability reactions. Replaced numeric match percentages with explicit plain-language bullet points and increased touch button targets to 44px for easy mobile thumb tapping.")
    add_bullet(doc, "Iteration 3 (Post-Visit 3)", "Polished the grievance tracking desk to include a clear coordinator response trail, giving students proof that their anonymous concerns were being actively addressed.")

    add_h2(doc, "5.2 Module-wise Implementation")
    add_bullet(doc, "Student Workspace", "Designed as a calm, distraction-free environment displaying personal applications, personalized match scores, and upcoming workshops.")
    add_bullet(doc, "Coordinator Review Queue", "Provides departmental faculty with clear candidate tables where they can select an applicant, review academic criteria, and attach constructive feedback.")
    add_bullet(doc, "Explainable Match Engine", "Compares student skills against job circular requirements and generates explicit, reassuring explanations.")
    add_bullet(doc, "Anonymous Feedback Pipeline", "Stores complaints with department tags while completely omitting student names, roll numbers, and contact details.")

    add_h2(doc, "5.3 User Interface Solution: Calm, Accessible, and Reassuring")
    add_para(doc, "The visual palette utilizes soothing slate backgrounds, professional navy blue headers, and warm amber/green status indicators. Typography was carefully configured to maintain high legibility under sunlight on mobile screens.")

    add_h2(doc, "5.4 Screenshots of Developed Solution")
    add_para(doc, "The visual screens of the developed platform are documented in the placeholders below:")

    add_callout_box(
        doc,
        "Figure 5.1: Student Profile & Explainable Skill Match Rationale",
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
        "Figure 5.3: Anonymous Grievance Redressal Desk",
        "Screenshot showing the student feedback form, ticket token generation, and the coordinator response history trail.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 6: TESTING AND VALIDATION
    # =========================================================================
    add_h1(doc, "CHAPTER 6: TESTING AND VALIDATION")

    add_h2(doc, "6.1 Test Scenarios: Empathy-Focused Usability Tasks")
    add_para(doc, "Testing during Visits 2 and 3 at Khalsa College focused not just on whether buttons worked, but on how students felt while using the platform. We evaluated four core user journeys:")
    add_bullet(doc, "Journey 1 (Discovering Hope)", "Finding job listings tailored specifically to the student's tech domain (CS/IT/DS).")
    add_bullet(doc, "Journey 2 (Understanding Eligibility)", "Reviewing the skill match breakdown to understand exactly what skills were required.")
    add_bullet(doc, "Journey 3 (Taking Action)", "Reserving a seat in an Advanced DSA & Coding Clinic with a single click.")
    add_bullet(doc, "Journey 4 (Finding a Voice)", "Submitting an anonymous concern regarding an unreasonable 12-hour test notice.")

    add_h2(doc, "6.2 Test Results Across Field Visits")
    add_para(doc, "Observing students complete these journeys across our visits revealed marked improvements in confidence and speed:")

    headers_test_v = ["User Journey", "Visit 2 Success", "Visit 2 Notes", "Visit 3 Success", "Visit 3 Notes"]
    data_test_v = [
        ["Journey 1: Job Discovery", "93.8% (30/32)", "Fast, but requested clearer remote tags.", "100.0% (40/40)", "Seamless and intuitive."],
        ["Journey 2: Match Explanation", "81.3% (26/32)", "Hesitation on percentage scores.", "97.5% (39/40)", "Plain-English reasons eliminated all doubt."],
        ["Journey 3: Clinic Booking", "100.0% (32/32)", "Instant relief over one-click booking.", "100.0% (40/40)", "Smooth, immediate confirmation."],
        ["Journey 4: Anonymous Grievance", "90.6% (29/32)", "Students checked if roll no was visible.", "97.5% (39/40)", "High reassurance from Ticket ID tokens."],
        ["Cumulative Average", "87.5%", "Initial friction on match logic.", "97.5%", "High student satisfaction and trust."]
    ]
    create_table(doc, headers_test_v, data_test_v)

    add_h2(doc, "6.3 User Acceptance Testing at Khalsa College")
    add_para(doc, "User Acceptance Testing conducted in Seminar Hall 2 during Visit 3 demonstrated overwhelming student endorsement. Students specifically appreciated that Skill Bridge does not hide behind unverified 'AI' algorithms, but provides transparent, honest rules. Female participants voiced profound appreciation for the anonymous feedback desk, stating it gave them courage to report scheduling clashes with evening travel commutes.")

    add_h2(doc, "6.4 Student Feedback & Iterative Refinements")
    add_bullet(doc, "Feedback on Match Scores", "In Visit 2, students expressed frustration over bare percentage numbers. We responded by creating an itemized breakdown showing exactly which languages and frameworks matched and which were missing.")
    add_bullet(doc, "Feedback on Urgent Drives", "Students requested visible countdown timers so they could instantly spot circulars closing within 24 hours. We added prominent color-coded badges.")

    add_h2(doc, "6.5 Performance & Emotional Impact Evaluation")
    add_para(doc, "The emotional impact was palpable. Students who had previously felt alienated by campus placements expressed a renewed sense of hope and clarity. Replacing the chaos of WhatsApp forwards with an authoritative dashboard reduced reported anxiety levels significantly among participants.")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 7: RESULTS AND IMPACT ASSESSMENT
    # =========================================================================
    add_h1(doc, "CHAPTER 7: RESULTS AND IMPACT ASSESSMENT")

    add_h2(doc, "7.1 Deliverables Submitted")
    add_bullet(doc, "Skill Bridge Community Web Application", "Fully realized dual-desk web platform designed for students and coordinators.")
    add_bullet(doc, "Verified Survey Dataset (200 Students)", "Empirical survey database documenting placement perceptions across CS, IT, and DS branches.")
    add_bullet(doc, "6-Dimension Student Empowerment Plan", "Practical institutional action plan addressing training, communication, and mental health.")
    add_bullet(doc, "Comprehensive CEP Project Documentation", "Detailed academic reports presenting our methodology, data, and findings.")

    add_h2(doc, "7.2 Results Achieved")
    add_para(doc, "Our study successfully gave voice to 200 undergraduate students, quantifying the hidden realities of campus placements and validating an empathetic solution:")
    add_bullet(doc, "Quantified the Care Deficit", "Proved that 72.5% of students feel underserved by existing placement systems.")
    add_bullet(doc, "Achieved 97.5% Usability Success", "Demonstrated that student-centered design eliminates cognitive friction and builds user confidence.")
    add_bullet(doc, "Strengthened Campus Trust", "Created an institutional dialogue between Khalsa College students and coordinators on fair placement practices.")

    add_h2(doc, "7.3 Impact on Student Mental Well-Being & Community Trust")
    add_para(doc, "By replacing rumor-filled chat groups with an authoritative dashboard and replacing opaque rejection with constructive learning paths, Skill Bridge protects student mental health. The anonymous grievance desk eliminates fear, restoring dignity and trust to the campus recruitment process.")

    add_h2(doc, "7.4 SDG Contribution")
    add_para(doc, "Directly advances SDG 4 (inclusive, equitable technical education), SDG 8 (decent work opportunities for youth), and SDG 10 (reducing educational inequalities through transparent, bias-free access).")

    add_page_break(doc)

    # =========================================================================
    # CHAPTER 8: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    add_h1(doc, "CHAPTER 8: CONCLUSION AND FUTURE SCOPE")

    add_h2(doc, "8.1 Conclusion")
    add_para(doc, "At its core, education is an act of human empowerment. When an undergraduate student spends years studying technology, the culmination of that journey should not be defined by panic over late message forwards or the silent agony of opaque rejection. Our Community Engagement Project at Guru Nanak Khalsa College, Matunga, demonstrated that placement challenges are fundamentally human challenges.")
    add_para(doc, "Through 200 verified survey responses and intensive 3-day field interactions, we listened to the real struggles of students. In response, 'Skill Bridge' demonstrated that when technology is built with empathy, transparency, and respect, it can transform campus placements from an anxiety-ridden gatekeeping trial into an inspiring, dignified journey of career growth.")

    add_h2(doc, "8.2 Key Findings: What Students Truly Need")
    add_bullet(doc, "Respect in Timing", "Students need placement circulars broadcast with sufficient lead time (at least 48 hours) to prepare mentally and technically.")
    add_bullet(doc, "Constructive Feedback Over Cold Rejection", "Students require clear explanations of skill gaps so they can direct their learning effectively.")
    add_bullet(doc, "Psychological Safety", "Anonymity on grievance channels is non-negotiable; students will only speak the truth when protected from institutional retaliation.")
    add_bullet(doc, "Hands-On Practical Training", "Colleges must replace generic pen-and-paper math aptitude with hands-on coding and framework clinics.")

    add_h2(doc, "8.3 Recommendations for Collegiate Placement Offices")
    add_bullet(doc, "Establish a Student-Centric Placement Charter", "Guarantee minimum 48-hour advance notice for all technical recruitment drives.")
    add_bullet(doc, "Mandate Explainable Feedback", "Require corporate recruiters to specify missing technical competencies for rejected candidates.")
    add_bullet(doc, "Institutionalize Anonymous Grievance Tracking", "Create a safe, digital feedback desk to resolve scheduling clashes without penalizing students.")
    add_bullet(doc, "Integrate Mental Health Support", "Offer pre-placement stress management counseling alongside technical preparation.")

    add_h2(doc, "8.4 Future Enhancements")
    add_bullet(doc, "Peer Mentorship & Buddy System", "Connect unplaced students with placed senior peers for mock technical interview practice.")
    add_bullet(doc, "Inter-Collegiate Support Networks", "Expand Skill Bridge across suburban Mumbai colleges to share job circulars and practical workshops.")
    add_bullet(doc, "Comprehensive Well-Being Tracking", "Incorporate optional student self-care check-ins during peak placement season.")

    add_page_break(doc)

    # =========================================================================
    # REFERENCES
    # =========================================================================
    add_h1(doc, "REFERENCES (MLA FORMAT)")

    refs = [
        "All India Council for Technical Education (AICTE). Model Curriculum for Undergraduate Degree Courses in Engineering & Technology. AICTE Publications, New Delhi, 2022.",
        "Aspiring Minds. National Employability Report: Engineers 2019. Aspiring Minds Research Cell, Gurugram, 2019.",
        "Dweck, Carol S. Mindset: The New Psychology of Success. Random House, New York, 2006.",
        "Guru Nanak Khalsa College of Arts, Science & Commerce. Departmental Placement Circulars, Notice Records, and Student Survey Archives. Matunga, Mumbai, Sept. 2026.",
        "Norman, Donald A. The Design of Everyday Things. Basic Books, New York, 2013.",
        "Pressman, Roger S., and Bruce R. Maxim. Software Engineering: A Practitioner's Approach. 9th ed., McGraw-Hill Education, New York, 2020.",
        "United Nations. The 2030 Agenda for Sustainable Development: Transforming Our World. United Nations Department of Economic and Social Affairs, New York, 2015.",
        "World Health Organization. Mental Health of Adolescents and Youth in Education. WHO Guidelines Approved by the Guidelines Review Committee, Geneva, 2021."
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
    add_para(doc, "Photographic documentation recorded during our three community visits to Guru Nanak Khalsa College of Arts, Science & Commerce, Matunga, Mumbai:")

    add_callout_box(
        doc,
        "Photo A.1: Visit 1 — Student Listening Circles & Needs Assessment",
        "Vidhi Mahato, Dhiraj Tendulkar, Gaurav Mhatre, and Varun Patil facilitating student focus group discussions in the Computing Laboratory at Khalsa College, Matunga (12 September 2026).",
        placeholder="(add picture)"
    )

    add_callout_box(
        doc,
        "Photo A.2: Visit 2 — Interactive Usability Walkthrough in Central Computing Lab",
        "Students testing the Skill Bridge interface on desktop terminals in CCF Lab 3 while Vidhi Mahato records user feedback and logs interface observations (19 September 2026).",
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
    add_para(doc, "The 12-question Google Form survey distributed manually to 200 students across Computer Science, Information Technology, and Data Science cohorts at Guru Nanak Khalsa College:")

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
    add_para(doc, "Student experience and empathy interview prompts utilized during listening circles across Visits 1, 2, and 3:")
    add_bullet(doc, "Student Experience Prompt 1", "How do you feel when you receive a placement circular late at night with an early morning test deadline?")
    add_bullet(doc, "Student Experience Prompt 2", "When you are rejected from a placement drive without any feedback, what impact does it have on your study motivation?")
    add_bullet(doc, "Student Experience Prompt 3", "Have you ever wanted to report an unfair drive timing or test glitch but chose not to? What held you back?")
    add_bullet(doc, "Coordinator Prompt 1", "How do you balance high recruiter volume with student individual well-being and feedback?")
    add_bullet(doc, "Coordinator Prompt 2", "What would help placement coordinators understand student grievances without confrontation?")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE D: REPORTING OFFICER / MENTOR FEEDBACK FORM")
    add_para(doc, "Blank evaluation form for Industry / Field Reporting Officer at Guru Nanak Khalsa College and Faculty Mentor at VSIT:")

    add_callout_box(
        doc,
        "Annexure D: Field Reporting Officer & Mentor Evaluation Sheet",
        "Official institutional rating sheet evaluating student empathy, community engagement quality, qualitative interviewing, and final report thoroughness.",
        placeholder="(add picture)"
    )

    add_page_break(doc)

    add_h2(doc, "ANNEXURE E: SOURCE CODE REPOSITORY LINK & PROJECT CONTENTS")
    add_para(doc, "Source code archive and project repository:")
    add_bullet(doc, "Repository URL", "https://github.com/dhiraj-tendulkar/skill-bridge-cep-portal (Local workspace: D:\\CEP website)")
    add_bullet(doc, "Repository Contents", "Complete web portal codebase, SQLite database migration scripts, empirical survey seeds, and full documentation suite.")

    add_page_break(doc)

    add_h2(doc, "ANNEXURE F: USER MANUAL & WORKFLOW GUIDE")
    add_para(doc, "User guide for students and placement coordinators focusing on transparent interactions and safe communication:")
    add_bullet(doc, "Student Instructions", "1. Open the portal; 2. Configure branch and skills in your profile; 3. Browse active circulars; 4. Review matched and missing skills; 5. Apply or book an upcoming workshop clinic; 6. Submit confidential feedback via the Feedback desk.")
    add_bullet(doc, "Coordinator Instructions", "1. Log into the Command Desk; 2. Create vacancies with required skill tags; 3. Review candidate lists with feedback; 4. Mark clinic attendance; 5. Review and resolve student grievances anonymously.")

    out_path = os.path.join(os.getcwd(), "CEP_Documentation_Vidhi_Mahato_24302A0028.docx")
    doc.save(out_path)
    print(f"Vidhi Mahato documentation built successfully: {out_path}")

if __name__ == "__main__":
    build_vidhi_documentation()
