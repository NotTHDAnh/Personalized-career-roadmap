import { useState, useEffect } from "react";
import { 
  Search, ShieldCheck, ChevronLeft, ChevronRight, BookOpen, 
  ChevronDown, ChevronUp, Code2, Edit2, MoreVertical, Trash2
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { apiClient } from "@/shared/api/apiClient";
import { Skeleton } from "@/app/components/ui/skeleton";
import { toast } from "sonner";

interface SkillData {
  skillId: string;
  skillName: string;
  category: string;
}

export function StaffSkillsView() {
  const [skills, setSkills] = useState<SkillData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isGlobalEditMode, setIsGlobalEditMode] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteType, setDeleteType] = useState<'single' | 'bulk'>('single');
  const [deleteSkillId, setDeleteSkillId] = useState<string | null>(null);
  const [deleteCountdown, setDeleteCountdown] = useState(5);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (deleteModalOpen && deleteCountdown > 0) {
      timer = setTimeout(() => {
        setDeleteCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [deleteModalOpen, deleteCountdown]);

  const handleOpenDelete = (type: 'single' | 'bulk', id: string | null = null) => {
    setDeleteType(type);
    setDeleteSkillId(id);
    setDeleteCountdown(5);
    setDeleteModalOpen(true);
    setOpenDropdownId(null);
  };

  const confirmDelete = async () => {
    if (deleteType === 'single' && deleteSkillId) {
      try {
        setIsLoading(true);
        await apiClient.delete(`/Skill/${deleteSkillId}`);
        setSkills(prev => prev.filter(s => s.skillId !== deleteSkillId));
        toast.success("Xóa kỹ năng thành công");
      } catch (error: any) {
        console.error("Delete failed:", error);
        toast.error(error?.response?.data?.message || "Lỗi khi xóa kỹ năng");
      } finally {
        setIsLoading(false);
      }
    } else if (deleteType === 'bulk') {
      try {
        setIsLoading(true);
        for (const id of selectedSkillIds) {
          try {
             await apiClient.delete(`/Skill/${id}`);
          } catch (e) {
             console.error(`Failed to delete skill ${id}`, e);
          }
        }
        setSkills(prev => prev.filter(s => !selectedSkillIds.includes(s.skillId)));
        toast.success(`Đã xóa thành công ${selectedSkillIds.length} kỹ năng`);
        setSelectedSkillIds([]);
      } catch (error: any) {
        console.error("Failed bulk delete:", error);
        toast.error("Một số kỹ năng xóa thất bại. Vui lòng thử lại");
      } finally {
        setIsLoading(false);
      }
    }
    setDeleteModalOpen(false);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter(entry => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          // Sort by boundingClientRect.top to find the top-most visible element
          visibleEntries.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveCategory(visibleEntries[0].target.id);
        }
      },
      { 
        root: document.getElementById('scroll-container'),
        rootMargin: "-100px 0px -50% 0px" 
      }
    );

    const elements = document.querySelectorAll('.category-section');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [skills, expandedCategories, searchTerm]);

  const scrollToCategory = (categoryId: string) => {
    const el = document.getElementById(categoryId);
    const container = document.getElementById('scroll-container');
    if (el && container) {
      // Offset for header
      const y = el.offsetTop - 40; // 40px offset
      container.scrollTo({ top: y, behavior: 'smooth' });
      setActiveCategory(categoryId);
    }
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get<any[]>("/Skill");
        const mappedSkills = data.map(s => ({
          skillId: s.skillId || s.SkillId,
          skillName: s.skillName || s.SkillName,
          category: s.category || s.Category || "Uncategorized"
        }));
        setSkills(mappedSkills);
        
        // Expand all categories by default
        const uniqueCategories = Array.from(new Set(mappedSkills.map(s => s.category)));
        const initialExpandedState: Record<string, boolean> = {};
        uniqueCategories.forEach(cat => {
          initialExpandedState[cat] = true;
        });
        setExpandedCategories(initialExpandedState);
      } catch (error) {
        console.error("Failed to fetch skills:", error);
        toast.error("Không thể tải danh sách kỹ năng");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSkills();
  }, []);

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredSkills = skills.filter(skill => 
    skill.skillName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.skillId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group skills by category
  const groupedSkills = filteredSkills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, SkillData[]>);

  // Sort categories alphabetically
  const sortedCategories = Object.keys(groupedSkills).sort();

  return (
    <div className="h-full w-full overflow-hidden flex bg-[#F4F7F9] relative">
      
      {/* Right Navigation Pane (Quick Nav) */}
      {sortedCategories.length > 0 && !isLoading && (
        <div className="fixed right-8 top-[65%] -translate-y-1/2 z-50 flex flex-col gap-[1px] items-end">
          {sortedCategories.map(cat => (
            <div 
              key={cat}
              onClick={() => scrollToCategory(cat)}
              className="flex items-center gap-3 cursor-pointer py-[1px] px-2 group"
            >
              <span className={`text-[12px] font-bold whitespace-nowrap transition-all duration-300 opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 
                ${activeCategory === cat ? 'text-[#3B28CC]' : 'text-[#94A3B8] hover:text-[#64748B]'}`}
              >
                {cat}
              </span>
              <div 
                className={`h-[2px] rounded-full transition-all duration-300 
                  ${activeCategory === cat ? 'w-6 bg-[#3B28CC]' : 'w-4 bg-[#CBD5E1] group-hover:bg-[#94A3B8] group-hover:w-5'}`} 
              />
            </div>
          ))}
        </div>
      )}

      <div id="scroll-container" className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col transition-all duration-300 relative">
        <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
          
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 text-[12px] text-[#64748B] font-semibold mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3B28CC]" />
                <span>Dashboard</span>
                <span>›</span>
                <span className="text-[#3B28CC]">Skills Directory</span>
              </div>
              <h1 className="text-[24px] font-bold tracking-tight text-[#0F172A] mb-1">
                Skills Directory ({filteredSkills.length})
              </h1>
              <p className="text-[13px] text-[#64748B]">All skills available in the system grouped by category</p>
            </div>
          </div>

          {/* Toolbar Section */}
          <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-3 flex-1 min-w-[200px] max-w-[480px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                <Input 
                  placeholder="Search by skill name, ID, or category..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 text-[13px] bg-white border-[#E2E8F0] focus-visible:ring-[#6366F1] shadow-sm rounded-lg"
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            
            {!isGlobalEditMode ? (
              <Button 
                onClick={() => setIsGlobalEditMode(true)}
                className="bg-[#1E293B] hover:bg-[#0F172A] text-white text-[13px] h-10 px-4 rounded-lg shadow-sm font-semibold transition-all"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in duration-300">
                {selectedSkillIds.length > 0 && (
                  <>
                    <span className="text-[13px] font-semibold text-[#0F172A] bg-white px-3 py-2 rounded-lg border border-[#E2E8F0]">
                      {selectedSkillIds.length} skills selected
                    </span>
                    <Button 
                      onClick={() => handleOpenDelete('bulk')}
                      className="bg-[#EF4444] hover:bg-[#DC2626] text-white text-[13px] h-10 px-4 rounded-lg shadow-sm font-semibold transition-all"
                    >
                      Bulk Delete
                    </Button>
                  </>
                )}
                <Button 
                  onClick={() => {
                    setIsGlobalEditMode(false);
                    setOpenDropdownId(null);
                    setSelectedSkillIds([]);
                  }}
                  variant="outline"
                  className="text-[13px] h-10 px-4 rounded-lg font-semibold transition-all border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
                >
                  Cancel Edit
                </Button>
              </div>
            )}
          </div>

          {/* Data Table / Groups */}
          <div className="space-y-6 mb-8 max-w-3xl">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden p-4">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-3">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              </div>
            ) : sortedCategories.length > 0 ? (
              sortedCategories.map(category => (
                <div key={category} id={category} className="category-section bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden transition-all duration-300">
                  {/* Category Header */}
                  <div 
                    className="flex items-center justify-between px-6 py-4 bg-[#F8FAFC] border-b border-[#E2E8F0] cursor-pointer hover:bg-[#F1F5F9] transition-colors"
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center gap-3">
                      <h3 className="text-[15px] font-bold text-[#0F172A]">{category}</h3>
                      <span className="bg-[#E0E7FF] text-[#3B28CC] text-[11px] font-bold px-2 py-0.5 rounded-full">
                        {groupedSkills[category].length} Skills
                      </span>
                    </div>
                    <button className="p-1 rounded-md text-[#64748B] hover:bg-[#E2E8F0] transition-colors">
                      {expandedCategories[category] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Skills List */}
                  {expandedCategories[category] && (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-100 border-collapse">
                        <thead>
                          <tr className="bg-white">
                            {isGlobalEditMode && (
                              <th className="px-4 py-3 w-12 text-center">
                                <input
                                  type="checkbox"
                                  checked={groupedSkills[category].every(s => selectedSkillIds.includes(s.skillId))}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedSkillIds(prev => [...new Set([...prev, ...groupedSkills[category].map(s => s.skillId)])]);
                                    } else {
                                      setSelectedSkillIds(prev => prev.filter(id => !groupedSkills[category].find(s => s.skillId === id)));
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-300 text-[#3B28CC] focus:ring-[#3B28CC]"
                                />
                              </th>
                            )}
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider w-[200px]">
                              Skill ID
                            </th>
                            <th className="px-6 py-3 text-left text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                              Skill Name
                            </th>
                            {isGlobalEditMode && (
                              <th className="px-4 py-3 w-12 text-center text-[11px] font-bold text-[#64748B] uppercase tracking-wider"></th>
                            )}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {groupedSkills[category].map((skill) => (
                            <tr key={skill.skillId} className="hover:bg-[#F8FAFC]/50 transition-colors">
                              {isGlobalEditMode && (
                                <td className="px-4 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={selectedSkillIds.includes(skill.skillId)}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedSkillIds(prev => [...prev, skill.skillId]);
                                      } else {
                                        setSelectedSkillIds(prev => prev.filter(id => id !== skill.skillId));
                                      }
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-[#3B28CC] focus:ring-[#3B28CC]"
                                  />
                                </td>
                              )}
                              <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono font-bold text-[#3B28CC]">
                                {skill.skillId}
                              </td>
                              <td className="px-6 py-4 text-[13px] font-bold text-[#0F172A]">
                                {skill.skillName}
                              </td>
                              {isGlobalEditMode && (
                                <td className="px-4 py-4 text-center relative dropdown-container">
                                  <button 
                                    onClick={() => setOpenDropdownId(openDropdownId === skill.skillId ? null : skill.skillId)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                                  >
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                  
                                  {openDropdownId === skill.skillId && (
                                    <div className="absolute right-8 top-10 w-36 bg-white border border-[#E2E8F0] shadow-lg rounded-xl z-10 py-1 overflow-hidden animate-in zoom-in-95 duration-100">
                                      <button 
                                        onClick={() => handleOpenDelete('single', skill.skillId)}
                                        className="w-full text-left px-4 py-2.5 text-[13px] font-semibold text-[#EF4444] hover:bg-[#FEF2F2] flex items-center gap-2 transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-[#E2E8F0] overflow-hidden py-16 text-center">
                <div className="flex flex-col items-center justify-center">
                  <Code2 className="w-10 h-10 text-[#CBD5E1] mb-3" />
                  <h3 className="text-[15px] font-bold text-[#0F172A] mb-1">No skills found</h3>
                  <p className="text-[13px] text-[#64748B]">Try adjusting your search terms.</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-[#EF4444]" />
              </div>
              <h2 className="text-[18px] font-bold text-[#0F172A] mb-2">Confirm Deletion</h2>
              <p className="text-[14px] text-[#475569] leading-relaxed">
                Are you sure you want to delete {deleteType === 'bulk' ? `the selected skills` : 'this skill'}? 
                This action will hide them from the system.
              </p>
            </div>
            <div className="p-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setDeleteModalOpen(false)}
                className="text-[13px] font-semibold border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9]"
              >
                Cancel
              </Button>
              <Button 
                onClick={confirmDelete}
                disabled={deleteCountdown > 0}
                className={`text-[13px] font-semibold text-white px-5 min-w-[120px] transition-all
                  ${deleteCountdown > 0 
                    ? 'bg-[#FCA5A5] cursor-not-allowed' 
                    : 'bg-[#EF4444] hover:bg-[#DC2626]'}`}
              >
                {deleteCountdown > 0 ? `Confirm (${deleteCountdown}s)` : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
