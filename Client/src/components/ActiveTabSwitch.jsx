// import { useChatStore } from "../stores/useChatStore";

// function ActiveTabSwitch() {
//   const { activeTab, setActiveTab } = useChatStore();

//   return (
//     <div className="tabs tabs-boxed bg-transparent flex p-2  w-full">
//       <button
//         onClick={() => setActiveTab("chats")}
//         className={`tab flex-1 rounded-3xl  ${
//           activeTab === "chats" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
//         }`}
//       >
//         Chats
//       </button>

//       <button
//         onClick={() => setActiveTab("contacts")}
//         className={`tab flex-1 rounded-3xl ${
//           activeTab === "contacts" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-400"
//         }`}
//       >
//         Contacts
//       </button>
//     </div>
//   );
// }
// export default ActiveTabSwitch;


import { useChatStore } from "../stores/useChatStore";

function ActiveTabSwitch() {
  const { activeTab, setActiveTab } = useChatStore();

  return (
    <div
      className={`tabs tabs-boxed relative bg-transparent flex p-1 w-full rounded-3xl 
      before:absolute before:top-1 before:bottom-1 before:left-1 
      before:w-[calc(50%-4px)] before:rounded-3xl 
      before:bg-cyan-500/20 before:transition-all before:duration-300 before:ease-in-out
      ${activeTab === "contacts" ? "before:translate-x-full" : ""}
      `}
    >
      <button
        onClick={() => setActiveTab("chats")}
        className={`tab flex-1 rounded-xl  relative z-10 transition-colors duration-300 ${
          activeTab === "chats"
            ? "text-cyan-400 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Chats
      </button>

      <button
        onClick={() => setActiveTab("contacts")}
        className={`tab flex-1 rounded-xl  relative z-10 transition-colors duration-300 ${
          activeTab === "contacts"
            ? "text-cyan-400 font-bold"
            : "text-slate-400 hover:text-slate-200"
        }`}
      >
        Contacts
      </button>
    </div>
  );
}

export default ActiveTabSwitch;