import mongoose from "mongoose";
import dotenv from "dotenv";
import { Lead } from "../models/lead.model.js";
import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import connect from "./index.js";

dotenv.config({
  path: "./.env"
});

const industryCompanies = {
  "Automotive": [
    { name: "Mahindra Heavy Engines", city: "Chakan", contact: "Anand Deshmukh", email: "a.deshmukh@mahindra.com", spec: "Ti-Hex-M16 Fasteners" },
    { name: "Maruti Suzuki Powertrain Div", city: "Gurugram", contact: "Kenji Sato", email: "k.sato@maruti.co.in", spec: "Aluminium CNC Engine Casings" },
    { name: "Tata Motors Commercial Chassis", city: "Jamshedpur", contact: "Dr. Anil Mukherji", email: "anil.m@tatamotors.com", spec: "AS9100D Steel Beams" },
    { name: "Bharat Forge Automotive Parts", city: "Pune", contact: "Pranav Kalyani", email: "p.kalyani@bharatforge.com", spec: "Tungsten Press Dies" },
    { name: "Ashok Leyland Defence Castings", city: "Ennore", contact: "R. Srinivasan", email: "r.srini@ashokleyland.com", spec: "Custom Chrome-Moly Tubing" },
    { name: "TVS Motor Engine Castings", city: "Hosur", contact: "S. Rajamani", email: "s.rajamani@tvs.co.in", spec: "Grade 5 Titanium Bolts" },
    { name: "Hero MotoCorp Powertrain Hub", city: "Dharuhera", contact: "Vikram Singhal", email: "v.singhal@heromotocorp.com", spec: "Extrusion Die Tooling" },
    { name: "Royal Enfield Custom Frame Works", city: "Oragadam", contact: "J. Cartwright", email: "j.cartwright@royalenfield.com", spec: "Chrome-Moly Alloy Tubes" },
    { name: "Force Motors Offroad Assemblies", city: "Pithampur", contact: "Abhay Firodia", email: "a.firodia@forcemotors.com", spec: "M36 Anchor Steel Bolts" },
    { name: "Sundram Fasteners Automotive Co", city: "Chennai", contact: "K. Ramesh", email: "k.ramesh@sundram.com", spec: "High Tensile Metal Washers" }
  ],
  "Aerospace": [
    { name: "Hindustan Aeronautics (HAL) Wings", city: "Bengaluru", contact: "Wing Cmdr. K. Rao (Retd.)", email: "k.rao@hal-india.com", spec: "Inconel 718 Turbine Pins" },
    { name: "Tata Advanced Systems Aerospace", city: "Hyderabad", contact: "Sukaran Singh", email: "s.singh@tatasystems.com", spec: "Aerospace Aluminium Sheets" },
    { name: "L&T Defence Aerospace Fabrication", city: "Coimbatore", contact: "Meera Deshmukh", email: "meera.d@lntecc.com", spec: "Titanium Airframe Rivets" },
    { name: "Dynamatic Technologies Aero Struct", city: "Bengaluru", contact: "Udayant Malhotra", email: "u.malhotra@dynamatics.com", spec: "Left Wing Rib Sub-Assembly" },
    { name: "Godrej Aerospace Engine Div", city: "Mumbai", contact: "Kaustubh Shukla", email: "k.shukla@godrej.com", spec: "Inconel Custom Machined Flanges" },
    { name: "Adani Defence Aero Shells", city: "Mundra", contact: "Ashish Rajvanshi", email: "a.rajvanshi@adani.com", spec: "7075-T6 Aerospace Sheets" },
    { name: "TASL Aerospace Structures", city: "Nagpur", contact: "Col. Sanjeev Varma", email: "s.varma@tasl.in", spec: "Wing Frame Support Pins" },
    { name: "Kalyani Strategic Aerospace", city: "Pune", contact: "Rajinder Bhatia", email: "r.bhatia@kalyani.com", spec: "Titanium M16 Hex Bolts" },
    { name: "Mahindra Aerospace Structures", city: "Kolar", contact: "S. P. Shukla", email: "sp.shukla@mahindra.com", spec: "Precision Wing Sheet Ribs" },
    { name: "BrahMos Aerospace Missiles Assembly", city: "Hyderabad", contact: "Dr. Sudhir Mishra", email: "s.mishra@brahmos.com", spec: "Tungsten Carbide Missiles Die" }
  ],
  "Electronics": [
    { name: "Bharat Electronics (BEL) Radar Div", city: "Ghaziabad", contact: "M. V. Gowtama", email: "mv.gowtama@bel.co.in", spec: "Aerospace Micro-controllers" },
    { name: " Dixon Technologies Electronics PCBA", city: "Noida", contact: "Atul Lall", email: "a.lall@dixoninfo.com", spec: "Grade 5 Titanium M12 Rivets" },
    { name: "Optiemus Electronics Assembly", city: "Greater Noida", contact: "A. Gupta", email: "a.gupta@optiemus.com", spec: "Aluminium precision PCB casing" },
    { name: "Syrma SGS Technology Systems", city: "Chennai", contact: "Sandeep Tandon", email: "s.tandon@syrmasgs.com", spec: "Micro-casing Fasteners" },
    { name: "Kaynes Technology Microelectronics", city: "Mysuru", contact: "Ramesh Kannan", email: "r.kannan@kaynestech.com", spec: "Ultra-precise Extrusion Dies" },
    { name: "Centum Electronics Aerospace Hub", city: "Bengaluru", contact: "Apparao Mallavarapu", email: "a.mallavarapu@centum.in", spec: "AS9100D Electronic Enclosures" },
    { name: "VVDN Technologies Network Casings", city: "Manesar", contact: "Puneet Agarwal", email: "p.agarwal@vvdntech.com", spec: "Chrome-Moly Network Framing" },
    { name: "Sanmina India High Precision PCBA", city: "Chennai", contact: "Steve Cooper", email: "s.cooper@sanmina.com", spec: "Precision Titanium Screws" },
    { name: "Foxconn India Electronics Hub", city: "Sriperumbudur", contact: "Young Liu", email: "y.liu@foxconn.com", spec: "Tungsten Press Die Tooling" },
    { name: "Tandon Information Micro Casings", city: "Mumbai", contact: "M. Tandon", email: "m.tandon@tandon.com", spec: "Aluminium Heat Dissipation Pls" }
  ],
  "Construction & Infrastructure": [
    { name: "L&T Construction Infrastructure", city: "Hazira", contact: "A. M. Naik", email: "am.naik@lntecc.com", spec: "Structural Chrome-Moly Beams" },
    { name: "Tata Steel Projects & Structures", city: "Kalinganagar", contact: "T. V. Narendran", email: "tv.narendran@tatasteel.com", spec: "M36 Anchor Steel Bolts" },
    { name: "Jindal Steel & Power Structures", city: "Angul", contact: "Naveen Jindal", email: "n.jindal@jindalsteel.com", spec: "High Strength Steel Tubing" },
    { name: "DLF Infrastructure Heavy Foundations", city: "Gurugram", contact: "K. P. Singh", email: "kp.singh@dlf.in", spec: "Anchor Metallurgy Fasteners" },
    { name: "GMR Infrastructure Bridges Div", city: "Delhi", contact: "Kiran Kumar Grandhi", email: "kiran.grandhi@gmrgroup.in", spec: "Titanium Expansion Joint Bolts" },
    { name: "Adani Infrastructure Heavy Metallurgy", city: "Ahmedabad", contact: "Karan Adani", email: "k.adani@adani.com", spec: "Tungsten Die Support Frames" },
    { name: "HCC Bridges & Dams Assemblies", city: "Mumbai", contact: "Ajit Gulabchand", email: "a.gulabchand@hccindia.com", spec: "Heavy-Gauge Chrome-Moly Tubes" },
    { name: "Shapoorji Pallonji Industrial Steel", city: "Mumbai", contact: "Cyrus Mistry", email: "c.mistry@shapoorji.com", spec: "Structural Aluminium Rib Plates" },
    { name: "Dilip Buildcon Road & Bridges", city: "Bhopal", contact: "Dilip Suryavanshi", email: "dilip.s@dilipbuildcon.co.in", spec: "M24 - M64 Anchor Bolts" },
    { name: "IRB Infrastructure Bridges Hub", city: "Pune", contact: "Virendra Mhaiskar", email: "v.mhaiskar@irb.co.in", spec: "Structural Steel Tie Rods" }
  ],
  "Medical Devices": [
    { name: "Trivatron Healthcare Implants", city: "Chennai", contact: "Dr. GSK Velu", email: "gsk.velu@trivatron.com", spec: "Medical Grade Titanium Fasteners" },
    { name: "Transasia Bio-Medicals Casings", city: "Mumbai", contact: "Suresh Vazirani", email: "s.vazirani@transasia.co.in", spec: "SS316L Food/Medical Grade Sheets" },
    { name: "Poly Medicure Surgical Implants", city: "Faridabad", contact: "Himanshu Baid", email: "h.baid@polymedicure.com", spec: "SS316L Joint Screws" },
    { name: "Meril Life Sciences Orthopedics", city: "Vapi", contact: "R. Vyas", email: "r.vyas@merillife.com", spec: "Grade 5 Titanium Surgical Pins" },
    { name: "Skanray Technologies Imaging Systems", city: "Mysuru", contact: "Vishwaprasad Alva", email: "v.alva@skanray.com", spec: "Aluminium Precision Sheet Housing" },
    { name: "Opto Circuits Medical Equipment", city: "Bengaluru", contact: "Vinod Ramnani", email: "v.ramnani@optocircuits.com", spec: "Precise Extrusion Casting Die" },
    { name: "BPL Medical Technologies Imaging", city: "Bengaluru", contact: "Sunil Khurana", email: "s.khurana@bplmedtech.com", spec: "SS316L Structural Brackets" },
    { name: "Mitra Industries Kidney Dialyzers", city: "Faridabad", contact: "N. Mitra", email: "n.mitra@mitraindustries.com", spec: "Titanium high-pressure casings" },
    { name: "Schiller Healthcare Systems India", city: "Mumbai", contact: "R. Schiller", email: "r.schiller@schillerindia.com", spec: "Aluminium wing sensor casing" },
    { name: "Agappe Diagnostics Reagents Casings", city: "Kochi", contact: "Thomas John", email: "t.john@agappe.com", spec: "Medical Grade Alloy Screws" }
  ],
  "Energy & Utilities": [
    { name: "Suzlon Energy Wind Turbines Hub", city: "Pune", contact: "Tulsi Tanti", email: "t.tanti@suzlon.com", spec: "Inconel 718 Custom Flanges" },
    { name: "Tata Power Hydro-Electric Turbines", city: "Lonavala", contact: "Praveer Sinha", email: "p.sinha@tatapower.com", spec: "Inconel Turbine Support Pins" },
    { name: "Adani Green Wind Turbine Blades", city: "Jaisalmer", contact: "Vneet Jaain", email: "v.jaain@adani.com", spec: "Aerospace Aluminium Structural Sheets" },
    { name: "BHEL Heavy Electricals Turbines", city: "Haridwar", contact: "Nalin Shinghal", email: "n.shinghal@bhel.in", spec: "Inconel Custom Machined Flanges" },
    { name: "NTPC Solar Enclosures & Supports", city: "Ramagundam", contact: "Gurdeep Singh", email: "g.singh@ntpc.co.in", spec: "Steel M16 Hex Bolts" },
    { name: "ReNew Power Solar Mounting Hub", city: "Jodhpur", contact: "Sumant Sinha", email: "s.sinha@renewpower.in", spec: "Structural Steel Tubing Frame" },
    { name: "BGC Energy Smart Grid Castings", city: "Indore", contact: "M. K. Sharma", email: "mk.sharma@bgcenergy.com", spec: "Tungsten Carbon Extrusion Dies" },
    { name: "Sterling & Wilson Energy Grids", city: "Mumbai", contact: "Khurshed Daruvala", email: "k.daruvala@sterlingwilson.com", spec: "Structural Aluminium Plates" },
    { name: "Wind World India Windmills Hub", city: "Daman", contact: "Yogesh Mehra", email: "y.mehra@windworld.com", spec: "Heavy M36 Anchor Bolts" },
    { name: "Azure Power Solar Steel Casings", city: "Delhi", contact: "Ranjit Gupta", email: "r.gupta@azurepower.com", spec: "Chrome-Moly Steel Supports" }
  ],
  "Chemicals & Plastics": [
    { name: "Reliance Industries Petrochemical Pipes", city: "Jamnagar", contact: "Mukesh Ambani", email: "m.ambani@ril.com", spec: "Corrosive-Resistant Flanges" },
    { name: "UPL Chemical Process Plant Piping", city: "Ankleshwar", contact: "Jai Shroff", email: "j.shroff@upl-ltd.com", spec: "Inconel Extreme Temperature Flanges" },
    { name: "Aarti Industries Corrosive Tanks", city: "Vapi", contact: "Rajendra Gogri", email: "r.gogri@aarti-industries.com", spec: "Grade 5 Titanium M16 Washers" },
    { name: "SRF Fluorochemicals Process Pipelines", city: "Dahej", contact: "Ashish Bharat Ram", email: "ashish@srf.com", spec: "Specialty superalloy flanges" },
    { name: "Supreme Industries Polymer Dies", city: "Jalgaon", contact: "M. P. Taparia", email: "mp.taparia@supreme.co.in", spec: "Tungsten Carbide Extrusion Die" },
    { name: "Astral Pipes High-Pressure Valves", city: "Ahmedabad", contact: "Sandeep Engineer", email: "s.engineer@astralpipes.com", spec: "Precision Extrusion Die Systems" },
    { name: "Pidilite Industries Polymer Mixers", city: "Vapi", contact: "Bharat Puri", email: "b.puri@pidilite.com", spec: "High Strength Chrome-Moly tubes" },
    { name: "Deepak Nitrite Chemical Piping Systems", city: "Nandesari", contact: "Deepak Mehta", email: "d.mehta@godeepak.com", spec: "SS316L Flanges and Seals" },
    { name: "Gujarat Fluorochemicals PTFE Seals", city: "Dahej", contact: "Devendra Jain", email: "djain@gfl.co.in", spec: "SS316L Polymer Coating Dies" },
    { name: "Tata Chemicals Process Piping", city: "Mithapur", contact: "R. Mukundan", email: "r.mukundan@tatachemicals.com", spec: "Grade 5 Titanium M12 Fasteners" }
  ],
  "Heavy Machinery": [
    { name: "L&T Heavy Engineering Valves Div", city: "Hazira", contact: "Meera Deshmukh", email: "meera.d@lntecc.com", spec: "3000 PSI High-Flow Valves" },
    { name: "Tata Hitachi Excavator Hydraulic Hub", city: "Kharagpur", contact: "Sandeep Singh", email: "s.singh@tatahitachi.co.in", spec: "Tungsten Carbide Extrusion Die" },
    { name: "Action Construction Equipment (ACE)", city: "Faridabad", contact: "Vijay Agarwal", email: "v.agarwal@ace-cranes.com", spec: "M24 - M64 Structural Bolts" },
    { name: "BEML Mining Machinery Struct Div", city: "Kolar Gold Fields", contact: "Amit Banerjee", email: "a.banerjee@beml.co.in", spec: "Heavy-Gauge Chrome-Moly Tubing" },
    { name: "JCB India Assembly Line Support", city: "Ballabgarh", contact: "Deepak Shetty", email: "d.shetty@jcb.com", spec: "Grade 5 Titanium M16 Fasteners" },
    { name: "Escorts Kubota Agri Machinery", city: "Faridabad", contact: "Nikhil Nanda", email: "n.nanda@escorts.co.in", spec: "Aluminium Precision Sheet Housing" },
    { name: "Sany Heavy Industry Excavators", city: "Pune", contact: "Deepak Garg", email: "d.garg@sany.in", spec: "Excavator Hydraulic Valves" },
    { name: "Action Construction Equipment Cranes", city: "Faridabad", contact: "Anil Kumar", email: "a.kumar@ace.in", spec: "High Strength Steel Frame Tubing" },
    { name: "Wirtgen India Road Construction", city: "Pune", contact: "Ramesh Palagiri", email: "r.palagiri@wirtgen.in", spec: "Anchor Bolts M36 Series" },
    { name: "Sandvik Mining Precision Tools", city: "Pune", contact: "J. S. Gill", email: "js.gill@sandvik.com", spec: "Tungsten Extrusion Die System" }
  ],
  "Other": [
    { name: "Haldiram Processors Food Grade Cas", city: "Nagpur", contact: "Rajesh Haldiram", email: "r.procure@haldiram.com", spec: "SS316L Food Safety Tubes" },
    { name: "ITC Paperboards Packaging Metallurgy", city: "Bhadrachalam", contact: "Sanjiv Puri", email: "s.puri@itc.in", spec: "High Precision Extrusion Dies" },
    { name: "Amul Dairy Processing Containers", city: "Anand", contact: "R. S. Sodhi", email: "rs.sodhi@amul.coop", spec: "SS316L Food Grade Fasteners" },
    { name: "Nestle India Moga Processing Plants", city: "Moga", contact: "Suresh Narayanan", email: "s.narayanan@in.nestle.com", spec: "SS316L Medical Grade Tubes" },
    { name: "Britannia Foods Machining Fasteners", city: "Ranjangaon", contact: "Varun Berry", email: "v.berry@britannia.co.in", spec: "Food Grade SS316L Screws" },
    { name: "Coca-Cola India Bottling Line", city: "Pune", contact: "Sanket Ray", email: "s.ray@coca-cola.com", spec: "SS316L Piping & Fasteners" },
    { name: "PepsiCo Foods Channapatna Processing", city: "Channapatna", contact: "Ahmed El Sheikh", email: "ahmed.sheikh@pepsico.com", spec: "High-Flow Regulator Valves" },
    { name: "Dabur India Processing Lines", city: "Sahibabad", contact: "Mohit Malhotra", email: "mohit.malhotra@dabur.com", spec: "Grade 5 Titanium M12 Fasteners" },
    { name: "Parle Biscuits Extrusion dies", city: "Bahadurgarh", contact: "Vijay Chauhan", email: "v.chauhan@parle.com", spec: "Tungsten Carbide Extrusion Die" },
    { name: "United Breweries Packaging Fasteners", city: "Kalyani", contact: "Rishi Pardal", email: "r.pardal@ubmail.com", spec: "Precision Aluminium Rib Sheets" }
  ]
};

const stages = ["New", "Contacted", "Qualified", "Quoted", "Negotiating", "Won", "Lost"];

const seedLeads = async () => {
  try {
    console.log("Connecting to MONGODB to seed 90 B2B Leads...");
    await connect();
    console.log("MONGODB Connected successfully!");

    // 1. Fetch or create a BDA User
    let bdaUser = await User.findOne({ role: "BDA" });
    if (!bdaUser) {
      bdaUser = await User.findOne({});
    }
    if (!bdaUser) {
      console.log("Seeding BDA User...");
      bdaUser = await User.create({
        name: "Vikash Kumar",
        email: "vikash@forgecrm.com",
        password: "password123",
        role: "BDA",
        isActive: true
      });
    }
    console.log(`Using BDA User: ${bdaUser.name} (${bdaUser._id})`);

    // 2. Clear existing leads and associated tasks/logs
    console.log("Purging existing Leads, Tasks, and Logs from database...");
    await Lead.deleteMany({});
    // Delete tasks that belong to leads (leads are deleted, so we clear them)
    await Task.deleteMany({});
    console.log("Cleaned up existing Lead/Task collections successfully!");

    // 3. Seed 10 Leads in each of the 9 categories
    let leadCount = 0;
    
    for (const [industry, companies] of Object.entries(industryCompanies)) {
      console.log(`\nSeeding 10 B2B Leads for industry category: [${industry}]`);
      
      for (let i = 0; i < companies.length; i++) {
        const co = companies[i];
        
        // Randomly distribute lead scores and pipeline stages
        const score = Math.floor(Math.random() * 45) + 50; // scores 50 to 95
        const stageIndex = i % stages.length; // distribute evenly across New, Contacted, Qualified, etc.
        const currentStage = stages[stageIndex];
        const revenue = (Math.floor(Math.random() * 15) + 1) * 10000000; // ₹1 Crore to ₹15 Crore
        
        const newLead = await Lead.create({
          companyName: co.name,
          industry: industry,
          companySize: i % 2 === 0 ? "500+" : "201-500",
          annualRevenue: revenue,
          address: {
            city: co.city,
            country: "India",
            state: "MH"
          },
          contacts: [
            {
              name: co.contact,
              designation: "Sourcing Manager",
              email: co.email,
              phone: "+91 99" + (Math.floor(Math.random() * 90000000) + 10000000),
              isPrimary: true
            }
          ],
          status: currentStage,
          source: i % 3 === 0 ? "Direct RFQ (Request for Quote)" : i % 3 === 1 ? "Website Inbound" : "Trade Show",
          assignedBDA: bdaUser._id,
          leadScore: score,
          customFields: {
            preferredMaterial: co.spec,
            isoCertReq: "AS9100D Compliance"
          }
        });

        // Add 2 tasks for each lead
        await Task.create([
          {
            title: "Complete initial requirements review call",
            description: `Review heavy metallurgy specs with ${co.contact} for ${co.name}`,
            type: "Call",
            leadId: newLead._id,
            assignedTo: bdaUser._id,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            status: i % 2 === 0 ? "Completed" : "Pending"
          },
          {
            title: "Create catalog parts matching checklist",
            description: `Establish specifications matrix mapping to B2B catalog items for ${co.name}`,
            type: "Prepare Quote",
            leadId: newLead._id,
            assignedTo: bdaUser._id,
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
            status: "Pending"
          }
        ]);

        leadCount++;
      }
    }

    console.log("\n-----------------------------------------------------");
    console.log("DATABASE LEADS SEEDING COMPLETED WITH ABSOLUTE SUCCESS!");
    console.log("-----------------------------------------------------");
    console.log(`Seeded exactly ${leadCount} B2B Leads populated with contacts and checklist tasks!`);
    console.log("Exactly 10 Leads successfully placed in each of the 9 category verticals.");
    console.log("-----------------------------------------------------\n");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding Leads database:", error.message);
    process.exit(1);
  }
};

seedLeads();
