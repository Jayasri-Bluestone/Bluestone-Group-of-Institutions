import React, { useMemo, useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, Database, CheckCircle, Edit3, X, Save, LayoutGrid, Users, Network, ChevronUp, ChevronDown, Mail, FileText } from 'lucide-react';
import * as Fa6Icons from 'react-icons/fa6';
import * as MdIcons from 'react-icons/md';
import * as IoIcons from 'react-icons/io5';
import * as AiIcons from 'react-icons/ai';
import * as RiIcons from 'react-icons/ri';
import * as BiIcons from 'react-icons/bi';
import { confirmToast } from '../../../utils/toastConfirm';
import { API_BASE_URL_PORTAL } from '../../../apiConfig';
import UserManagement from './UserManagement';
import Pagination from '../Layout/Pagination';
import MultiDomainDropdown from './MultiSelectDD';

const ICON_PACKS = {
  fa6: Fa6Icons,
  md: MdIcons,
  io5: IoIcons,
  ai: AiIcons,
  ri: RiIcons,
  bi: BiIcons,
};

const DEFAULT_ICON_KEY = 'fa6:FaLayerGroup';
const EMPTY_EDITING_ITEM = {
  type: null,
  id: null,
  value: '',
  icon_type: 'default',
  icon_name: DEFAULT_ICON_KEY,
  logo_url: '',
};

const getReactIconComponentByKey = (iconKey) => {
  if (!iconKey) return Fa6Icons.FaLayerGroup;
  if (!iconKey.includes(':')) {
    return Fa6Icons[iconKey] || Fa6Icons.FaLayerGroup;
  }
  const [pack, iconName] = iconKey.split(':');
  const source = ICON_PACKS[pack];
  if (!source) return Fa6Icons.FaLayerGroup;
  return source[iconName] || Fa6Icons.FaLayerGroup;
};

const MasterManagement = ({ user }) => {
  const AUTO_REFRESH_MS = 300000; // Updated from 30s to 5m to prevent DB exhaust
  const [data, setData] = useState([]);
  const isSuperAdmin = user?.tier === 'SUPER_ADMIN' || ['Main Admin', 'MD', 'GM', 'Super Admin'].includes(user?.role);
  const [activeTab, setActiveTab] = useState(() => (isSuperAdmin ? 'domain_setup' : 'user_management'));
  const [hierarchy, setHierarchy] = useState([]);
  const [newHierarchy, setNewHierarchy] = useState({ tier: 'ADMIN', role_name: '' });
  const [editingHierarchy, setEditingHierarchy] = useState(null);
  const [hierarchyPage, setHierarchyPage] = useState(1);
  const [hierarchyItemsPerPage, setHierarchyItemsPerPage] = useState(10);
  const [domainPage, setDomainPage] = useState(1);
  const [domainItemsPerPage, setDomainItemsPerPage] = useState(10);
  const [domainItemsPerPageValue, setDomainItemsPerPageValue] = useState(10);

  const [domainSortBy, setDomainSortBy] = useState('sequence');
  const [domainSortOrder, setDomainSortOrder] = useState('asc');
  const [hierarchySortBy, setHierarchySortBy] = useState('id');
  const [hierarchySortOrder, setHierarchySortOrder] = useState('asc');
  const [systemEmails, setSystemEmails] = useState([]);
  const [newSystemEmail, setNewSystemEmail] = useState({ label: '', email: '' });
  const [editingSystemEmail, setEditingSystemEmail] = useState(null);

  const sortedDomains = useMemo(() => {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      if (domainSortBy === 'sequence') {
        aVal = Number.isFinite(Number(a.sequence)) ? Number(a.sequence) : Number.POSITIVE_INFINITY;
        bVal = Number.isFinite(Number(b.sequence)) ? Number(b.sequence) : Number.POSITIVE_INFINITY;
      } else {
        aVal = String(a[domainSortBy] || '').toLowerCase();
        bVal = String(b[domainSortBy] || '').toLowerCase();
      }

      if (aVal < bVal) return domainSortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return domainSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, domainSortBy, domainSortOrder]);

  const sortedHierarchy = useMemo(() => {
    return [...hierarchy].sort((a, b) => {
      let aVal = a[hierarchySortBy];
      let bVal = b[hierarchySortBy];

      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (aVal < bVal) return hierarchySortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return hierarchySortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [hierarchy, hierarchySortBy, hierarchySortOrder]);

  const actualItemsPerPage = hierarchyItemsPerPage === 'all' ? Math.max(1, hierarchy.length) : hierarchyItemsPerPage;
  const totalHierarchyPages = Math.ceil(hierarchy.length / actualItemsPerPage);

  const currentHierarchyData = sortedHierarchy.slice(
    (hierarchyPage - 1) * actualItemsPerPage,
    hierarchyPage * actualItemsPerPage
  );
  useEffect(() => {
    if (!isSuperAdmin) {
      setActiveTab('user_management');
    }
  }, [isSuperAdmin]);
  const domainTotalPages = Math.max(Math.ceil(sortedDomains.length / domainItemsPerPage), 1);
  const domainIndexOfLast = domainPage * domainItemsPerPage;
  const domainIndexOfFirst = domainIndexOfLast - domainItemsPerPage;
  const currentDomains = sortedDomains.slice(domainIndexOfFirst, domainIndexOfLast);
  useEffect(() => {
    if (domainItemsPerPageValue === 'all') {
      setDomainItemsPerPage(Math.max(sortedDomains.length, 1));
    }
  }, [sortedDomains.length, domainItemsPerPageValue]);

  // Create States
  const [newDomain, setNewDomain] = useState('');
  const [newDomainSequence, setNewDomainSequence] = useState('');
  const [newDomainIconType, setNewDomainIconType] = useState('default');
  const [newDomainIconName, setNewDomainIconName] = useState(DEFAULT_ICON_KEY);
  const [iconSearch, setIconSearch] = useState('');
  const [newDomainLogo, setNewDomainLogo] = useState('');
  const [newCat, setNewCat] = useState({ domainId: '', name: '' });
  const [selection, setSelection] = useState({ catId: '', value: '' });
  const fileInputRef = useRef(null);

  // Custom dropdown states for sub-values
  const [openSubValuesCatId, setOpenSubValuesCatId] = useState(null);
  const [selectedCategoryByDomain, setSelectedCategoryByDomain] = useState({});
  const [selectedValueByDomain, setSelectedValueByDomain] = useState({});
  const [showAddCategoryByDomain, setShowAddCategoryByDomain] = useState({});
  const [showAddValueByDomain, setShowAddValueByDomain] = useState({});
  const [newCategoryByDomain, setNewCategoryByDomain] = useState({});
  const [newValueByDomain, setNewValueByDomain] = useState({});

  // Edit States
  const [editingItem, setEditingItem] = useState(EMPTY_EDITING_ITEM);
  const [editIconSearch, setEditIconSearch] = useState('');
  const [domainEditModal, setDomainEditModal] = useState({
    isOpen: false,
    id: null,
    name: '',
    sequence: '',
    icon_type: 'default',
    icon_name: DEFAULT_ICON_KEY,
    logo_url: '',
  });

  // Documentation States
  const [documents, setDocuments] = useState([]);
  const [docModal, setDocModal] = useState({
    isOpen: false,
    id: null,
    document_name: '',
    is_mandatory: true,
    access_configs: [{ domain_id: '', category_id: '', value_id: '' }]
  });
  const [docSearch, setDocSearch] = useState('');
  const [docPage, setDocPage] = useState(1);
  const [docItemsPerPage, setDocItemsPerPage] = useState(10);
  const [docItemsPerPageValue, setDocItemsPerPageValue] = useState(10);

  const filteredDocuments = useMemo(() => {
    return documents.filter(d =>
      d.document_name.toLowerCase().includes(docSearch.toLowerCase())
    );
  }, [documents, docSearch]);

  const docTotalPages = Math.max(Math.ceil(filteredDocuments.length / docItemsPerPage), 1);
  const docIndexOfLast = docPage * docItemsPerPage;
  const docIndexOfFirst = docIndexOfLast - docItemsPerPage;
  const currentDocumentsPaged = filteredDocuments.slice(docIndexOfFirst, docIndexOfLast);

  useEffect(() => {
    if (docItemsPerPageValue === 'all') {
      setDocItemsPerPage(Math.max(filteredDocuments.length, 1));
    }
  }, [filteredDocuments.length, docItemsPerPageValue]);

  useEffect(() => {
    setDocPage(1);
  }, [docSearch]);

  const openNewDocModal = () => {
    setDocModal({
      isOpen: true,
      id: null,
      document_name: '',
      is_mandatory: true,
      access_configs: [{ domain_id: '', category_id: '', value_id: '' }]
    });
  };

  const openEditDocModal = (doc) => {
    setDocModal({
      isOpen: true,
      id: doc.id,
      document_name: doc.document_name,
      is_mandatory: Boolean(doc.is_mandatory),
      access_configs: doc.access_configs && doc.access_configs.length > 0
        ? doc.access_configs
        : [{ domain_id: '', category_id: '', value_id: '' }]
    });
  };

  const allIconOptions = useMemo(() => {
    return Object.entries(ICON_PACKS).flatMap(([pack, icons]) =>
      Object.entries(icons)
        .filter(([iconName, IconComp]) => iconName !== 'IconContext' && typeof IconComp === 'function')
        .map(([iconName, IconComp]) => ({
          key: `${pack}:${iconName}`,
          label: iconName,
          pack,
          component: IconComp,
        })),
    );
  }, []);

  const filteredIconOptions = useMemo(() => {
    const q = iconSearch.trim().toLowerCase();
    if (!q) return allIconOptions.slice(0, 120);
    return allIconOptions
      .filter((item) => `${item.label} ${item.pack}`.toLowerCase().includes(q))
      .slice(0, 150);
  }, [allIconOptions, iconSearch]);

  const fetchAll = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/full-structure`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Fetch failed", err);
      toast.error("Failed to load master data");
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchHierarchy = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      setHierarchy(await res.json());
    } catch {
      toast.error("Failed to load user hierarchy");
    }
  };

  useEffect(() => {
    fetchHierarchy();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchAll();
      fetchHierarchy();
      fetchSystemEmails();
    }, AUTO_REFRESH_MS);
    return () => clearInterval(timer);
  }, []);

  const fetchSystemEmails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/system-emails`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      setSystemEmails(await res.json());
    } catch {
      toast.error("Failed to load managed emails");
    }
  };

  useEffect(() => {
    if (activeTab === 'manage_mail_id') {
      fetchSystemEmails();
    }
    if (activeTab === 'documentation') {
      fetchDocuments();
    }
  }, [activeTab]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setDocuments(await res.json());
    } catch { toast.error("Failed to load documentation list"); }
  };

  const saveDocument = async () => {
    if (!docModal.document_name.trim()) {
      toast.error("Document name is required");
      return;
    }
    if (!(await confirmToast("Save document configuration?", "Save"))) return;
    const tid = toast.loading("Saving document...");
    try {
      const isEdit = !!docModal.id;
      const url = isEdit 
        ? `${API_BASE_URL_PORTAL}/api/master/documents/${docModal.id}`
        : `${API_BASE_URL_PORTAL}/api/master/documents`;
      
      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentName: docModal.document_name,
          isMandatory: docModal.is_mandatory,
          access_configs: docModal.access_configs.filter(c => c.domain_id)
        })
      });

      if (!res.ok) throw new Error();
      toast.success(isEdit ? "Document updated" : "Document added", { id: tid });
      setDocModal(prev => ({ ...prev, isOpen: false }));
      fetchDocuments();
    } catch {
      toast.error("Failed to save document", { id: tid });
    }
  };

  const toggleDocMandatory = async (doc) => {
    if (!(await confirmToast(`Change mandatory status for ${doc.document_name}?`, "Change"))) return;
    const tid = toast.loading("Updating status...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentName: doc.document_name,
          isMandatory: !doc.is_mandatory,
          access_configs: doc.access_configs
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated", { id: tid });
      fetchDocuments();
    } catch {
      toast.error("Update failed", { id: tid });
    }
  };

  const updateDocDomains = async (doc, domainNames) => {
    if (!(await confirmToast(`Update domain access for ${doc.document_name}?`, "Update"))) return;
    const newConfigs = domainNames.map(name => {
      const d = data.find(item => item.name === name);
      return { domain_id: d?.id };
    }).filter(c => c.domain_id);

    const tid = toast.loading("Updating domains...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/documents/${doc.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          documentName: doc.document_name,
          isMandatory: doc.is_mandatory,
          access_configs: newConfigs
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Domains updated", { id: tid });
      fetchDocuments();
    } catch {
      toast.error("Update failed", { id: tid });
    }
  };

  const deleteDocument = async (id) => {
    if (!(await confirmToast("Delete this document definition?"))) return;
    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/documents/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error();
      toast.success("Document deleted", { id: tid });
      fetchDocuments();
    } catch {
      toast.error("Delete failed", { id: tid });
    }
  };

  const addDocAccessRule = () => {
    setDocModal(prev => ({
      ...prev,
      access_configs: [...prev.access_configs, { domain_id: '', category_id: '', value_id: '' }]
    }));
  };

  const removeDocAccessRule = (index) => {
    setDocModal(prev => ({
      ...prev,
      access_configs: prev.access_configs.filter((_, i) => i !== index)
    }));
  };

  const updateDocAccessRule = (index, field, value) => {
    setDocModal(prev => {
      const newConfigs = [...prev.access_configs];
      newConfigs[index] = { ...newConfigs[index], [field]: value };
      
      // Reset dependent fields if domain or category changes
      if (field === 'domain_id') {
        newConfigs[index].category_id = '';
        newConfigs[index].value_id = '';
      } else if (field === 'category_id') {
        newConfigs[index].value_id = '';
      }
      
      return { ...prev, access_configs: newConfigs };
    });
  };

  const addSystemEmail = async () => {
    if (!newSystemEmail.label.trim() || !newSystemEmail.email.trim()) return;
    const tid = toast.loading("Adding email ID...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/system-emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newSystemEmail),
      });
      if (!res.ok) throw new Error();
      toast.success("Email ID added", { id: tid });
      setNewSystemEmail({ label: '', email: '' });
      fetchSystemEmails();
    } catch {
      toast.error("Failed to add email ID", { id: tid });
    }
  };

  const saveSystemEmail = async () => {
    if (!editingSystemEmail?.label?.trim() || !editingSystemEmail?.email?.trim()) return;
    const tid = toast.loading("Saving changes...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/system-emails/${editingSystemEmail.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editingSystemEmail),
      });
      if (!res.ok) throw new Error();
      toast.success("Email ID updated", { id: tid });
      setEditingSystemEmail(null);
      fetchSystemEmails();
    } catch {
      toast.error("Failed to update email ID", { id: tid });
    }
  };

  const deleteSystemEmail = async (id) => {
    const ok = await confirmToast("Delete this managed email ID?", "Delete");
    if (!ok) return;
    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/system-emails/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully", { id: tid });
      fetchSystemEmails();
    } catch {
      toast.error("Delete failed", { id: tid });
    }
  };

  const addHierarchyRole = async () => {
    if (!newHierarchy.role_name.trim()) return;
    const ok = await confirmToast(`Add new role "${newHierarchy.role_name}" to ${newHierarchy.tier}?`, "Add Role");
    if (!ok) return;
    const tid = toast.loading("Adding role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(newHierarchy),
      });
      if (!res.ok) throw new Error();
      toast.success("Role added", { id: tid });
      setNewHierarchy({ tier: 'ADMIN', role_name: '' });
      fetchHierarchy();
    } catch {
      toast.error("Failed to add role", { id: tid });
    }
  };

  const saveHierarchyRole = async () => {
    if (!editingHierarchy?.role_name?.trim()) return;
    const ok = await confirmToast("Save changes to this role?", "Save Changes");
    if (!ok) return;
    const tid = toast.loading("Saving role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${editingHierarchy.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(editingHierarchy),
      });
      if (!res.ok) throw new Error();
      toast.success("Role updated", { id: tid });
      setEditingHierarchy(null);
      fetchHierarchy();
    } catch {
      toast.error("Failed to update role", { id: tid });
    }
  };

  const toggleHierarchyStatus = async (row) => {
    const action = Number(row.is_active) === 1 ? 'Deactivate' : 'Activate';
    const ok = await confirmToast(`${action} role "${row.role_name}"?`, action);
    if (!ok) return;
    const tid = toast.loading("Updating status...");
    try {
      const updatedRow = { ...row, is_active: row.is_active ? 0 : 1 };
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${row.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedRow),
      });
      if (!res.ok) throw new Error();
      toast.success("Status updated", { id: tid });
      fetchHierarchy();
    } catch {
      toast.error("Failed to update status", { id: tid });
    }
  };

  const deleteHierarchyRole = async (id) => {
    const ok = await confirmToast("Delete this hierarchy role?", "Delete");
    if (!ok) return;
    const tid = toast.loading("Deleting role...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/user-hierarchy/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      if (!res.ok) throw new Error();
      toast.success("Role deleted", { id: tid });
      fetchHierarchy();
    } catch {
      toast.error("Failed to delete role", { id: tid });
    }
  };

  // --- CREATE ACTIONS ---
  const addDomain = async () => {
    if (!newDomain) return;
    if (newDomainIconType === 'logo' && !newDomainLogo) {
      toast.error('Please upload a logo image');
      return;
    }
    const tid = toast.loading("Adding domain...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({
          name: newDomain,
          sequence: newDomainSequence !== '' ? Number(newDomainSequence) : null,
          icon_type: newDomainIconType,
          icon_name: newDomainIconType === 'react_icon' ? newDomainIconName : null,
          logo_url: newDomainIconType === 'logo' ? newDomainLogo : null
        })
      });
      if (!res.ok) throw new Error();
      toast.success("Domain added", { id: tid });
      setNewDomain('');
      setNewDomainIconType('default');
      setNewDomainIconName(DEFAULT_ICON_KEY);
      setIconSearch('');
      setNewDomainLogo('');
      setNewDomainSequence('');
      fetchAll();
    } catch {
      toast.error("Failed to add domain", { id: tid });
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setNewDomainLogo(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const renderDomainIconPreview = () => {
    if (newDomainIconType === 'logo' && newDomainLogo) {
      return (
        <img
          src={newDomainLogo}
          alt="logo preview"
          className="w-8 h-8 rounded object-cover border border-slate-200"
        />
      );
    }
    if (newDomainIconType === 'react_icon') {
      const IconComp = getReactIconComponentByKey(newDomainIconName);
      return <IconComp className="w-5 h-5 text-slate-700" />;
    }
    return <Fa6Icons.FaLayerGroup className="w-5 h-5 text-slate-700" />;
  };

  const addCategory = async () => {
    if (!newCat.domainId || !newCat.name) return;
    const tid = toast.loading("Adding category...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ domain_id: newCat.domainId, name: newCat.name })
      });
      if (!res.ok) throw new Error();
      toast.success("Category added", { id: tid });
      setNewCat({ ...newCat, name: '' });
      fetchAll();
    } catch {
      toast.error("Failed to add category", { id: tid });
    }
  };

  const addValue = async () => {
    if (!selection.catId || !selection.value) return;
    const tid = toast.loading("Adding value...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ category_id: selection.catId, value: selection.value })
      });
      if (!res.ok) throw new Error();
      toast.success("Value added", { id: tid });
      setSelection({ ...selection, value: '' });
      fetchAll();
    } catch {
      toast.error("Failed to add value", { id: tid });
    }
  };

  const handleBulkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selection.catId) {
      toast.error("Please select a Category first.");
      e.target.value = ''; // Reset input
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      if (!text) return;

      // Basic CSV parsing: split by newlines and commas, ignore empty
      const rawValues = text.split(/[\r\n,]+/).map(v => v.trim()).filter(v => v);

      if (rawValues.length === 0) {
        toast.error("No valid values found in CSV");
        return;
      }

      const tid = toast.loading(`Uploading ${rawValues.length} values...`);
      try {
        const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/values/bulk`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ category_id: selection.catId, values: rawValues })
        });

        const contentType = res.headers.get("content-type");
        if (!res.ok) {
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await res.json();
            throw new Error(data.error || data.msg || 'Upload failed');
          } else {
            throw new Error(`Upload failed with status: ${res.status}`);
          }
        }

        const data = await res.json();
        toast.success(data.msg || "Values uploaded", { id: tid });
        fetchAll();
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to bulk upload", { id: tid });
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  // --- EDIT ACTIONS ---
  const startEdit = (type, id, currentText, extra = {}) => {
    setEditingItem({
      ...EMPTY_EDITING_ITEM,
      type,
      id,
      value: currentText,
      ...extra,
    });
    setEditIconSearch('');
  };

  const saveEdit = async () => {
    if (!(await confirmToast(`Save changes to ${editingItem.type.slice(0, -1)}?`, "Save"))) return;
    const { type, id, value } = editingItem;
    const endpoint = `${API_BASE_URL_PORTAL}/api/master/${type}/${id}`;

    // Map the payload key based on type (name for domain/cat, sub_value for value)
    const payload = type === 'values'
      ? { sub_value: value }
      : type === 'domains'
        ? {
          name: value,
          icon_type: editingItem.icon_type || 'default',
          icon_name: editingItem.icon_type === 'react_icon' ? (editingItem.icon_name || DEFAULT_ICON_KEY) : null,
          logo_url: editingItem.icon_type === 'logo' ? (editingItem.logo_url || null) : null,
        }
        : { name: value };

    const tid = toast.loading("Saving changes...");
    try {
      const res = await fetch(endpoint, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      toast.success("Updated successfully", { id: tid });
      setEditingItem(EMPTY_EDITING_ITEM);
      setEditIconSearch('');
      fetchAll();
    } catch {
      toast.error("Update failed", { id: tid });
    }
  };
  const openDomainEditModal = (domain) => {
    setEditIconSearch('');
    setDomainEditModal({
      isOpen: true,
      id: domain.id,
      name: domain.name || '',
      sequence: domain.sequence ?? '',
      icon_type: domain.icon_type || 'default',
      icon_name: domain.icon_name || DEFAULT_ICON_KEY,
      logo_url: domain.logo_url || '',
    });
  };
  const closeDomainEditModal = () => {
    setDomainEditModal({
      isOpen: false,
      id: null,
      name: '',
      sequence: '',
      icon_type: 'default',
      icon_name: DEFAULT_ICON_KEY,
      logo_url: '',
    });
    setEditIconSearch('');
  };
  const saveDomainEdit = async () => {
    if (!domainEditModal.id || !domainEditModal.name.trim()) return;
    const payload = {
      name: domainEditModal.name.trim(),
      sequence: domainEditModal.sequence !== '' ? Number(domainEditModal.sequence) : null,
      icon_type: domainEditModal.icon_type || 'default',
      icon_name: domainEditModal.icon_type === 'react_icon' ? (domainEditModal.icon_name || DEFAULT_ICON_KEY) : null,
      logo_url: domainEditModal.icon_type === 'logo' ? (domainEditModal.logo_url || null) : null,
    };
    const tid = toast.loading("Saving domain...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/domains/${domainEditModal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error();
      toast.success("Domain updated", { id: tid });
      closeDomainEditModal();
      fetchAll();
    } catch {
      toast.error("Update failed", { id: tid });
    }
  };
  const addCategoryForDomain = async (domainId) => {
    const name = String(newCategoryByDomain[domainId] || '').trim();
    if (!domainId || !name) return;
    const tid = toast.loading("Adding category...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ domain_id: domainId, name })
      });
      if (!res.ok) throw new Error();
      toast.success("Category added", { id: tid });
      setNewCategoryByDomain((prev) => ({ ...prev, [domainId]: '' }));
      setShowAddCategoryByDomain((prev) => ({ ...prev, [domainId]: false }));
      fetchAll();
    } catch {
      toast.error("Failed to add category", { id: tid });
    }
  };
  const addValueForCategory = async (domainId) => {
    const catId = selectedCategoryByDomain[domainId];
    const value = String(newValueByDomain[domainId] || '').trim();
    if (!catId || !value) return;
    const tid = toast.loading("Adding value...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/values`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ category_id: catId, value })
      });
      if (!res.ok) throw new Error();
      toast.success("Value added", { id: tid });
      setNewValueByDomain((prev) => ({ ...prev, [domainId]: '' }));
      setShowAddValueByDomain((prev) => ({ ...prev, [domainId]: false }));
      fetchAll();
    } catch {
      toast.error("Failed to add value", { id: tid });
    }
  };

  // --- DELETE ACTIONS ---
  const handleDelete = async (type, id) => {
    const confirmed = await confirmToast(`Delete this ${type.slice(0, -1)}?`, "Delete");
    if (!confirmed) return;

    const tid = toast.loading("Deleting...");
    try {
      const res = await fetch(`${API_BASE_URL_PORTAL}/api/master/${type}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error();
      toast.success("Deleted successfully", { id: tid });
      fetchAll();
    } catch {
      toast.error("Delete failed", { id: tid });
    }
  };

  // Removed legacy documentation actions (moved to centralized tab)

  const handleEditLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setEditingItem((prev) => ({
        ...prev,
        icon_type: 'logo',
        logo_url: String(reader.result || ''),
      }));
    };
    reader.readAsDataURL(file);
  };

  const filteredEditIconOptions = useMemo(() => {
    const q = editIconSearch.trim().toLowerCase();
    if (!q) return allIconOptions.slice(0, 120);
    return allIconOptions
      .filter((item) => `${item.label} ${item.pack}`.toLowerCase().includes(q))
      .slice(0, 150);
  }, [allIconOptions, editIconSearch]);

  const SortHeader = ({ label, sortKey, sortBy, sortOrder, setSortBy, setSortOrder, className = "" }) => {
    const isActive = sortBy === sortKey;
    return (
      <th
        className={`p-3 text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer hover:bg-slate-100/50 transition-colors ${className}`}
        onClick={() => {
          if (isActive) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(sortKey);
            setSortOrder('desc');
          }
        }}
      >
        <div className={`flex items-center gap-1.5 ${className.includes('center') ? 'justify-center' : className.includes('right') ? 'justify-end' : 'justify-start'}`}>
          {label}
          <div className="flex flex-col -gap-1">
            <ChevronUp size={10} className={isActive && sortOrder === 'asc' ? "text-blue-600" : "text-slate-300"} />
            <ChevronDown size={10} className={isActive && sortOrder === 'desc' ? "text-blue-600" : "text-slate-300"} />
          </div>
        </div>
      </th>
    );
  };

  return (
    <div className="space-y-10 rounded-2xl font-sans">
      {/* <header className="flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg text-white shadow-lg shadow-blue-200">
          <Database size={24}/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Master Setup</h1>
        </div>
      </header> */}

      <div className="flex border-b border-slate-100">
        <div className="flex gap-8">
          {[
            isSuperAdmin ? { id: 'domain_setup', label: 'Domain Setup', icon: LayoutGrid, activeColor: 'text-blue-600' } : null,
            { id: 'user_management', label: 'User Management', icon: Users, activeColor: 'text-indigo-600' },
            isSuperAdmin ? { id: 'user_hierarchy', label: 'User Hierarchy', icon: Network, activeColor: 'text-blue-600' } : null,
            isSuperAdmin ? { id: 'documentation', label: 'Documentation', icon: FileText, activeColor: 'text-emerald-600' } : null,
            isSuperAdmin ? { id: 'manage_mail_id', label: 'Manage Mail ID', icon: Mail, activeColor: 'text-rose-600' } : null,
          ].filter(Boolean).map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`group relative flex items-center gap-2 py-2 px-1 transition-all duration-300 ${isActive ? tab.activeColor : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                <div className={`p-2 rounded-lg transition-all duration-500 ${isActive ? 'bg-white shadow-sm scale-110' : 'group-hover:bg-slate-50'
                  }`}>
                  <Icon size={18} className={`transition-transform duration-500 ${isActive ? 'rotate-0' : 'group-hover:scale-110'}`} />
                </div>
                <span className={`text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-70 group-hover:opacity-100'}`}>
                  {tab.label}
                </span>

                {/* Active Indicator & Glow */}
                {isActive && (
                  <>
                    <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-full ${isActive ? 'bg-current' : ''} ${tab.glow} z-20`} />
                    <div className="absolute inset-0 bg-gradient-to-t from-current/5 to-transparent pointer-events-none rounded-t-2xl opacity-50" />
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {activeTab === 'domain_setup' && (
        <>
          {/* --- ADD SECTION --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 1: Domain</label>
              <div className="space-y-2">
                <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Overseas" value={newDomain} onChange={e => setNewDomain(e.target.value)} />
                <input
                  className="flex-1 p-2 border rounded-lg text-sm"
                  type="number"
                  min="1"
                  placeholder="Sequence (e.g. 1)"
                  value={newDomainSequence}
                  onChange={(e) => setNewDomainSequence(e.target.value)}
                />
                <select
                  className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                  value={newDomainIconType}
                  onChange={(e) => setNewDomainIconType(e.target.value)}
                >
                  <option value="default">Default Icon</option>
                  <option value="react_icon">React Icon</option>
                  <option value="logo">Upload Logo</option>
                </select>

                {newDomainIconType === 'react_icon' && (
                  <div className="space-y-2">
                    <input
                      type="text"
                      className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                      placeholder="Search icons (e.g. user, chart, school)"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                    />
                    <div className="max-h-44 overflow-y-auto border rounded-lg bg-slate-50 p-2 grid grid-cols-6 gap-2">
                      {filteredIconOptions.map((opt) => {
                        const IconComp = opt.component;
                        const selected = newDomainIconName === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            title={`${opt.pack}:${opt.label}`}
                            onClick={() => setNewDomainIconName(opt.key)}
                            className={`h-9 w-9 rounded-lg border flex items-center justify-center transition-colors ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                              }`}
                          >
                            <IconComp size={16} />
                          </button>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">
                      Selected: {newDomainIconName}
                    </p>
                  </div>
                )}

                {newDomainIconType === 'logo' && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                  />
                )}

                <div className="flex items-center justify-between border rounded-lg p-2 bg-slate-50">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Icon Preview</span>
                  {renderDomainIconPreview()}
                </div>

                <button onClick={addDomain} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-colors w-full flex items-center justify-center"><Plus size={18} /></button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-black uppercase text-blue-600 mb-2 block">Step 2: Category</label>
              <div className="space-y-2">
                <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" onChange={e => setNewCat({ ...newCat, domainId: e.target.value })}>
                  <option>Select Domain</option>
                  {sortedDomains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. Test Prep" value={newCat.name} onChange={e => setNewCat({ ...newCat, name: e.target.value })} />
                  <button onClick={addCategory} className="bg-slate-800 text-white p-2 rounded-lg hover:bg-black transition-colors"><Plus size={18} /></button>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <label className="text-[10px] font-black uppercase text-blue-600 mb-2 flex items-center justify-between">
                <span>Step 3: Sub-Value</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-2 py-1 rounded text-[9px] font-bold uppercase transition-colors flex items-center gap-1 border border-emerald-200"
                    title="Upload CSV of values"
                  >
                    <Database size={10} /> Import CSV
                  </button>
                  <input
                    type="file"
                    accept=".csv,.txt"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleBulkUpload}
                  />
                </div>
              </label>
              <div className="space-y-2">
                <select className="w-full p-2 border rounded-lg bg-slate-50 text-sm" onChange={e => setSelection({ ...selection, catId: e.target.value })}>
                  <option>Select Category</option>
                  {sortedDomains.flatMap(d => d.categories || []).map(c => (
                    <option key={c.id} value={c.id}>{c.domain_name} → {c.category_name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input className="flex-1 p-2 border rounded-lg text-sm" placeholder="e.g. IELTS" value={selection.value} onKeyDown={e => e.key === 'Enter' && addValue()} onChange={e => setSelection({ ...selection, value: e.target.value })} />
                  <button onClick={addValue} className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"><CheckCircle size={18} /></button>
                </div>
              </div>
            </div>
          </div>

          {/* --- LIVE HIERARCHY WITH EDIT/DELETE --- */}
          <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
            <div className="p-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-[0.2em] flex justify-between">
              <span>Live Master Structure</span>
              <span className="text-slate-400">MD/GM Access Only</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b">
                  <tr>
                    <SortHeader label="#" sortKey="sequence" sortBy={domainSortBy} sortOrder={domainSortOrder} setSortBy={setDomainSortBy} setSortOrder={setDomainSortOrder} className="w-[6%]" />
                    <th className="p-3 w-[8%]">Icon</th>
                    <SortHeader label="Domain" sortKey="name" sortBy={domainSortBy} sortOrder={domainSortOrder} setSortBy={setDomainSortBy} setSortOrder={setDomainSortOrder} className="w-[20%]" />
                    <th className="p-3 w-[26%]">Categories</th>
                    <th className="p-3 w-[26%]">Sub-Values</th>
                    <th className="p-3 w-[14%] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentDomains.map((domain, idx) => {
                    const categories = domain.categories || [];
                    const selectedCatId = selectedCategoryByDomain[domain.id] || categories[0]?.id || '';
                    const selectedCategory = categories.find((c) => c.id === selectedCatId);
                    const values = selectedCategory?.values || [];
                    const selectedValueId = selectedValueByDomain[domain.id] || values[0]?.id || '';
                    const selectedValue = values.find((v) => v.id === selectedValueId);
                    const sequenceDisplay = Number.isFinite(Number(domain.sequence)) ? Number(domain.sequence) : (domainIndexOfFirst + idx + 1);
                    return (
                      <tr key={domain.id} className="align-top">
                        <td className="p-3 text-xs font-bold text-slate-500">{sequenceDisplay}</td>
                        <td className="p-3">
                          {domain.icon_type === 'logo' && domain.logo_url ? (
                            <img
                              src={domain.logo_url}
                              alt={domain.name}
                              className="w-7 h-7 rounded object-cover border border-slate-200"
                            />
                          ) : domain.icon_type === 'react_icon' ? (
                            React.createElement(getReactIconComponentByKey(domain.icon_name), { className: 'w-5 h-5 text-slate-600' })
                          ) : (
                            <Fa6Icons.FaLayerGroup className="w-5 h-5 text-slate-600" />
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-black text-slate-800 uppercase text-xs whitespace-normal break-words">{domain.name}</div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-widest">Domain</div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <select
                                className="w-full p-2 border rounded-lg bg-slate-50 text-xs"
                                value={selectedCatId}
                                onChange={(e) =>
                                  setSelectedCategoryByDomain((prev) => ({ ...prev, [domain.id]: Number(e.target.value) || '' }))
                                }
                              >
                                <option value="">Select Category</option>
                                {categories.map((c) => (
                                  <option key={c.id} value={c.id}>{c.category_name}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => selectedCategory && startEdit('categories', selectedCategory.id, selectedCategory.category_name)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"
                                title="Edit selected category"
                                disabled={!selectedCategory}
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => selectedCategory && handleDelete('categories', selectedCategory.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100"
                                title="Delete selected category"
                                disabled={!selectedCategory}
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            {editingItem.type === 'categories' && editingItem.id === selectedCatId && (
                              <div className="flex gap-2">
                                <input
                                  autoFocus
                                  className="flex-1 p-2 border rounded-lg text-xs"
                                  value={editingItem.value}
                                  onChange={(e) => setEditingItem((prev) => ({ ...prev, value: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="p-2 rounded-lg bg-emerald-600 text-white"
                                  title="Save"
                                >
                                  <Save size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(EMPTY_EDITING_ITEM)}
                                  className="p-2 rounded-lg bg-slate-200 text-slate-600"
                                  title="Cancel"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            {showAddCategoryByDomain[domain.id] ? (
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 p-2 border rounded-lg text-xs"
                                  placeholder="New category"
                                  value={newCategoryByDomain[domain.id] || ''}
                                  onChange={(e) =>
                                    setNewCategoryByDomain((prev) => ({ ...prev, [domain.id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => addCategoryForDomain(domain.id)}
                                  className="p-2 rounded-lg bg-blue-600 text-white"
                                  title="Add category"
                                >
                                  <CheckCircle size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowAddCategoryByDomain((prev) => ({ ...prev, [domain.id]: false }))}
                                  className="p-2 rounded-lg bg-slate-200 text-slate-600"
                                  title="Cancel"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAddCategoryByDomain((prev) => ({ ...prev, [domain.id]: true }))}
                                className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 w-fit"
                              >
                                Add Category
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <select
                                className="w-full p-2 border rounded-lg bg-slate-50 text-xs"
                                value={selectedValueId}
                                onChange={(e) =>
                                  setSelectedValueByDomain((prev) => ({ ...prev, [domain.id]: Number(e.target.value) || '' }))
                                }
                                disabled={!selectedCatId}
                              >
                                <option value="">{selectedCatId ? "Select Sub-Value" : "Select Category first"}</option>
                                {values.map((v) => (
                                  <option key={v.id} value={v.id}>{v.sub_value}</option>
                                ))}
                              </select>
                              <button
                                type="button"
                                onClick={() => selectedValue && startEdit('values', selectedValue.id, selectedValue.sub_value)}
                                className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"
                                title="Edit selected sub-value"
                                disabled={!selectedValue}
                              >
                                <Edit3 size={12} />
                              </button>
                              <button
                                type="button"
                                onClick={() => selectedValue && handleDelete('values', selectedValue.id)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100"
                                title="Delete selected sub-value"
                                disabled={!selectedValue}
                              >
                                <Trash2 size={12} />
                              </button>
                              {/* Documentation button removed - now centralized */}
                            </div>
                            {editingItem.type === 'values' && editingItem.id === selectedValueId && (
                              <div className="flex gap-2">
                                <input
                                  autoFocus
                                  className="flex-1 p-2 border rounded-lg text-xs"
                                  value={editingItem.value}
                                  onChange={(e) => setEditingItem((prev) => ({ ...prev, value: e.target.value }))}
                                  onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                />
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="p-2 rounded-lg bg-emerald-600 text-white"
                                  title="Save"
                                >
                                  <Save size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItem(EMPTY_EDITING_ITEM)}
                                  className="p-2 rounded-lg bg-slate-200 text-slate-600"
                                  title="Cancel"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            )}
                            {showAddValueByDomain[domain.id] ? (
                              <div className="flex gap-2">
                                <input
                                  className="flex-1 p-2 border rounded-lg text-xs"
                                  placeholder="New sub-value"
                                  value={newValueByDomain[domain.id] || ''}
                                  onChange={(e) =>
                                    setNewValueByDomain((prev) => ({ ...prev, [domain.id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => addValueForCategory(domain.id)}
                                  className="p-2 rounded-lg bg-emerald-600 text-white"
                                  title="Add sub-value"
                                  disabled={!selectedCatId}
                                >
                                  <CheckCircle size={12} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setShowAddValueByDomain((prev) => ({ ...prev, [domain.id]: false }))}
                                  className="p-2 rounded-lg bg-slate-200 text-slate-600"
                                  title="Cancel"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setShowAddValueByDomain((prev) => ({ ...prev, [domain.id]: true }))}
                                className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 w-fit"
                                disabled={!selectedCatId}
                              >
                                Add Sub-Value
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-2">
                             {/* Documentation button removed - now centralized */}
                            <button
                              type="button"
                              onClick={() => openDomainEditModal(domain)}
                              className="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"
                              title="Edit domain"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete('domains', domain.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-600 border border-red-100"
                              title="Delete domain"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              stats={{ currentPage: domainPage, totalPages: domainTotalPages }}
              onPageChange={(newPage) => setDomainPage(newPage)}
              pageSize={domainItemsPerPage}
              pageSizeValue={domainItemsPerPageValue}
              onPageSizeChange={(value) => {
                if (value === 'all') {
                  setDomainItemsPerPageValue('all');
                  setDomainItemsPerPage(Math.max(sortedDomains.length, 1));
                  setDomainPage(1);
                  return;
                }
                const numeric = Number(value);
                setDomainItemsPerPageValue(numeric);
                setDomainItemsPerPage(numeric);
                setDomainPage(1);
              }}
              pageSizeOptions={[10, 20, 50, 100, 'all']}
            />
          </div>
        </>
      )}

      {activeTab === 'user_management' && (
        <div className="rounded-2xl overflow-hidden">
          <UserManagement user={user} />
        </div>
      )}



      {activeTab === 'user_hierarchy' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-4">User Hierarchy Setup</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <select
                className="p-2 border rounded-lg text-sm bg-slate-50"
                value={newHierarchy.tier}
                onChange={(e) => setNewHierarchy((prev) => ({ ...prev, tier: e.target.value }))}
              >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </select>
              <input
                className="p-2 border rounded-lg text-sm md:col-span-2"
                placeholder="Role name (e.g. Coordinator, Head)"
                value={newHierarchy.role_name}
                onChange={(e) => setNewHierarchy((prev) => ({ ...prev, role_name: e.target.value }))}
              />
              <button
                type="button"
                onClick={addHierarchyRole}
                className="bg-slate-900 text-white rounded-lg text-sm font-bold px-4 py-2 hover:bg-black"
              >
                Add Role
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <div className="p-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-wide">
              Maintained Roles
            </div>
            <div className="p-4 overflow-y-auto max-h-[500px] border-b border-slate-200">
              <table className="w-full text-sm relative">
                <thead className="text-[10px] uppercase text-slate-500 sticky top-0 bg-white z-10 shadow-sm">
                  <tr>
                    <SortHeader label="Tier" sortKey="tier" sortBy={hierarchySortBy} sortOrder={hierarchySortOrder} setSortBy={setHierarchySortBy} setSortOrder={setHierarchySortOrder} className="text-left" />
                    <SortHeader label="Role" sortKey="role_name" sortBy={hierarchySortBy} sortOrder={hierarchySortOrder} setSortBy={setHierarchySortBy} setSortOrder={setHierarchySortOrder} className="text-left" />
                    <SortHeader label="Status" sortKey="is_active" sortBy={hierarchySortBy} sortOrder={hierarchySortOrder} setSortBy={setHierarchySortBy} setSortOrder={setHierarchySortOrder} className="text-center" />
                    <th className="p-2 text-center font-black text-slate-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {currentHierarchyData.map((row) => {
                    const isEditing = editingHierarchy?.id === row.id;
                    return (
                      <tr key={row.id}>
                        <td className="p-2">
                          {isEditing ? (
                            <select
                              className="p-1 border rounded text-xs bg-slate-50"
                              value={editingHierarchy.tier}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, tier: e.target.value }))}
                            >
                              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                              <option value="ADMIN">ADMIN</option>
                              <option value="STAFF">STAFF</option>
                            </select>
                          ) : row.tier}
                        </td>
                        <td className="p-2">
                          {isEditing ? (
                            <input
                              className="p-1 border rounded text-xs w-full"
                              value={editingHierarchy.role_name}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, role_name: e.target.value }))}
                            />
                          ) : <div className="whitespace-normal break-words">{row.role_name}</div>}
                        </td>
                        <td className="p-2 text-center">
                          {isEditing ? (
                            <select
                              className="p-1 border rounded text-xs bg-slate-50"
                              value={Number(editingHierarchy.is_active)}
                              onChange={(e) => setEditingHierarchy((prev) => ({ ...prev, is_active: Number(e.target.value) }))}
                            >
                              <option value={1}>Active</option>
                              <option value={0}>Inactive</option>
                            </select>
                          ) : (
                            <button
                              onClick={() => toggleHierarchyStatus(row)}
                              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 ease-in-out ${Number(row.is_active) === 1 ? 'bg-emerald-500' : 'bg-slate-300'
                                }`}
                              role="switch"
                              aria-checked={Number(row.is_active) === 1}
                              title={Number(row.is_active) === 1 ? "Click to Deactivate" : "Click to Activate"}
                            >
                              <span
                                aria-hidden="true"
                                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${Number(row.is_active) === 1 ? 'translate-x-2' : '-translate-x-2'
                                  }`}
                              />
                            </button>
                          )}
                        </td>
                        <td className="p-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {isEditing ? (
                              <>
                                <button onClick={saveHierarchyRole} className="text-green-600"><Save size={14} /></button>
                                <button onClick={() => setEditingHierarchy(null)} className="text-slate-400"><X size={14} /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => setEditingHierarchy({ ...row })} className="text-blue-500"><Edit3 size={14} /></button>
                                <button onClick={() => deleteHierarchyRole(row.id)} className="text-red-500"><Trash2 size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {hierarchy.length > 0 && (
              <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200 text-xs shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                    <span>Show</span>
                    <select
                      className="border border-slate-300 rounded p-1 bg-white text-slate-700 outline-none hover:border-blue-400 focus:border-blue-500"
                      value={hierarchyItemsPerPage}
                      onChange={(e) => {
                        setHierarchyItemsPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                        setHierarchyPage(1);
                      }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value="all">All</option>
                    </select>
                    <span>entries</span>
                  </div>
                  <span className="text-slate-400">|</span>
                  <span className="text-slate-500 font-medium tracking-wide">
                    Showing {((hierarchyPage - 1) * actualItemsPerPage) + 1} to {Math.min(hierarchyPage * actualItemsPerPage, hierarchy.length)} of {hierarchy.length} Roles
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    disabled={hierarchyPage === 1}
                    onClick={() => setHierarchyPage(p => Math.max(1, p - 1))}
                    className="px-3 py-1.5 border border-slate-300 rounded-md bg-white text-slate-700 disabled:bg-slate-100 disabled:text-slate-400 font-medium hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    disabled={hierarchyPage === totalHierarchyPages}
                    onClick={() => setHierarchyPage(p => Math.min(totalHierarchyPages, p + 1))}
                    className="px-3 py-1.5 border border-blue-600 rounded-md bg-blue-600 text-white disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-300 font-medium hover:bg-blue-700 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'documentation' && (
        <div className="space-y-6">
          {/* Header & Search */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                <FileText size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Documentation Requirements</h2>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Centralized document management system</p>
              </div>
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <FileText size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search documents..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm font-bold focus:ring-4 ring-emerald-500/5 outline-none transition-all"
                  value={docSearch}
                  onChange={e => setDocSearch(e.target.value)}
                />
              </div>
              <button
                onClick={openNewDocModal}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95"
              >
                <Plus size={18} /> Add Document
              </button>
            </div>
          </div>

          {/* Table Header / Pagination Info */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between px-2">
            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
              <span>Show</span>
              <select
                className="border border-slate-200 rounded-lg px-2 py-1 bg-white text-slate-700 outline-none hover:border-emerald-400 focus:border-emerald-500 transition-colors cursor-pointer shadow-sm"
                value={docItemsPerPageValue}
                onChange={(e) => {
                  const val = e.target.value === 'all' ? 'all' : Number(e.target.value);
                  setDocItemsPerPageValue(val);
                  if (val !== 'all') setDocItemsPerPage(val);
                  setDocPage(1);
                }}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="all">All</option>
              </select>
              <span>Entries</span>
              <span className="text-slate-200 mx-2">|</span>
              <span className="text-slate-500">
                Displaying {filteredDocuments.length === 0 ? 0 : docIndexOfFirst + 1} - {Math.min(docIndexOfLast, filteredDocuments.length)} of {filteredDocuments.length} Documents
              </span>
            </div>
          </div>

          {/* Documents Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 relative">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Document Name</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Mandatory</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Applied To</th>
                    <th className="p-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentDocumentsPaged.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-slate-50 rounded-full text-slate-300">
                            <FileText size={40} />
                          </div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No documents found matching your criteria</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentDocumentsPaged.map(doc => (
                      <tr key={doc.id} className="hover:bg-slate-50/30 transition-colors group">
                        <td className="p-5">
                          <span className="text-sm font-black text-slate-700 uppercase tracking-tight group-hover:text-emerald-600 transition-colors">
                            {doc.document_name}
                          </span>
                        </td>
                        <td className="p-5 text-center">
                          <button
                            onClick={() => toggleDocMandatory(doc)}
                            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out ${doc.is_mandatory ? 'bg-emerald-500' : 'bg-slate-300'}`}
                          >
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${doc.is_mandatory ? 'translate-x-2' : '-translate-x-2'}`} />
                          </button>
                        </td>
                        <td className="p-5">
                          <MultiDomainDropdown
                            domains={data}
                            value={doc.access_configs.map(c => data.find(d => Number(d.id) === Number(c.domain_id))?.name).filter(Boolean).join(", ")}
                            onChange={(val) => updateDocDomains(doc, val.split(",").map(s => s.trim()).filter(Boolean))}
                            className="max-w-xs"
                          />
                        </td>
                        <td className="p-5 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditDocModal(doc)}
                              className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                              title="Edit"
                            >
                              <Edit3 size={16} />
                            </button>
                            <button
                              onClick={() => deleteDocument(doc.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Component */}
            {filteredDocuments.length > 0 && (
              <div className="p-4 border-t border-slate-50 bg-slate-50/30">
                <Pagination
                  stats={{ currentPage: docPage, totalPages: docTotalPages }}
                  onPageChange={(newPage) => setDocPage(newPage)}
                  pageSize={docItemsPerPage}
                  pageSizeValue={docItemsPerPageValue}
                  onPageSizeChange={(val) => {
                    setDocItemsPerPageValue(val);
                    if (val !== 'all') setDocItemsPerPage(val);
                    setDocPage(1);
                  }}
                  pageSizeOptions={[10, 20, 50, 100, 'all']}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'manage_mail_id' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-4 flex items-center gap-2">
              <Plus size={16} className="text-rose-500" /> Add Managed Email ID
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Label (e.g. Sales Team)</label>
                <input
                  className="w-full p-3 border rounded-xl text-sm font-bold bg-slate-50 focus:ring-4 ring-rose-500/5 transition-all outline-none"
                  placeholder="Recipient Label"
                  value={newSystemEmail.label}
                  onChange={e => setNewSystemEmail({ ...newSystemEmail, label: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Email Address</label>
                <input
                  className="w-full p-3 border rounded-xl text-sm font-bold bg-slate-50 focus:ring-4 ring-rose-500/5 transition-all outline-none"
                  placeholder="recipient@example.com"
                  value={newSystemEmail.email}
                  onChange={e => setNewSystemEmail({ ...newSystemEmail, email: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addSystemEmail}
                  className="w-full bg-slate-800 text-white p-3 rounded-xl hover:bg-black transition-all font-bold flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> ADD EMAIL
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-slate-400" />
                <h3 className="text-xs font-black text-slate-600 uppercase tracking-widest">Managed Mail List</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase">{systemEmails.length} Records</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Label</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">Email Address</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center">Status</th>
                    <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {systemEmails.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-10 text-center text-slate-400 font-bold uppercase text-xs italic">
                        No managed emails found. Add your first recipient above.
                      </td>
                    </tr>
                  ) : (
                    systemEmails.map((email) => {
                      const isEditing = editingSystemEmail?.id === email.id;
                      return (
                        <tr key={email.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4">
                            {isEditing ? (
                              <input
                                className="w-full p-2 border rounded-lg text-sm font-bold bg-white"
                                value={editingSystemEmail.label}
                                onChange={e => setEditingSystemEmail({ ...editingSystemEmail, label: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm font-bold text-slate-700">{email.label}</span>
                            )}
                          </td>
                          <td className="p-4">
                            {isEditing ? (
                              <input
                                className="w-full p-2 border rounded-lg text-sm font-bold bg-white"
                                value={editingSystemEmail.email}
                                onChange={e => setEditingSystemEmail({ ...editingSystemEmail, email: e.target.value })}
                              />
                            ) : (
                              <span className="text-sm text-slate-500 font-medium">{email.email}</span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <select
                                className="p-2 border rounded-lg text-xs font-bold"
                                value={editingSystemEmail.is_active}
                                onChange={e => setEditingSystemEmail({ ...editingSystemEmail, is_active: Number(e.target.value) })}
                              >
                                <option value={1}>ACTIVE</option>
                                <option value={0}>INACTIVE</option>
                              </select>
                            ) : (
                              <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${Number(email.is_active) === 1 ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {Number(email.is_active) === 1 ? 'Active' : 'Inactive'}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              {isEditing ? (
                                <>
                                  <button onClick={saveSystemEmail} className="text-emerald-600 hover:scale-110 transition-transform"><Save size={16} /></button>
                                  <button onClick={() => setEditingSystemEmail(null)} className="text-slate-400 hover:scale-110 transition-transform"><X size={16} /></button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditingSystemEmail({ ...email })} className="text-blue-500 hover:scale-110 transition-transform"><Edit3 size={16} /></button>
                                  <button onClick={() => deleteSystemEmail(email.id)} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {domainEditModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[999] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="font-black text-slate-800 text-lg">EDIT DOMAIN</h3>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Update master domain</p>
              </div>
              <button onClick={closeDomainEditModal} className="bg-slate-200 hover:bg-slate-300 p-1 rounded-full transition-colors">
                <X size={18} className="text-slate-600" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Domain Name</label>
                <input
                  className="w-full p-2 border rounded-lg text-sm"
                  value={domainEditModal.name}
                  onChange={(e) => setDomainEditModal((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Sequence</label>
                <input
                  className="w-full p-2 border rounded-lg text-sm"
                  type="number"
                  min="1"
                  value={domainEditModal.sequence}
                  onChange={(e) => setDomainEditModal((prev) => ({ ...prev, sequence: e.target.value }))}
                  placeholder="e.g. 1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase">Icon Type</label>
                <select
                  className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                  value={domainEditModal.icon_type}
                  onChange={(e) => setDomainEditModal((prev) => ({ ...prev, icon_type: e.target.value }))}
                >
                  <option value="default">Default Icon</option>
                  <option value="react_icon">React Icon</option>
                  <option value="logo">Upload Logo</option>
                </select>
              </div>
              {domainEditModal.icon_type === 'react_icon' && (
                <div className="space-y-2">
                  <input
                    type="text"
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                    placeholder="Search icons"
                    value={editIconSearch}
                    onChange={(e) => setEditIconSearch(e.target.value)}
                  />
                  <div className="max-h-40 overflow-y-auto border rounded bg-slate-50 p-2 grid grid-cols-8 gap-1">
                    {filteredEditIconOptions.map((opt) => {
                      const IconComp = opt.component;
                      const selected = domainEditModal.icon_name === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          title={`${opt.pack}:${opt.label}`}
                          onClick={() => setDomainEditModal((prev) => ({ ...prev, icon_name: opt.key }))}
                          className={`h-7 w-7 rounded border flex items-center justify-center ${selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-200'
                            }`}
                        >
                          <IconComp size={13} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {domainEditModal.icon_type === 'logo' && (
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (!file.type.startsWith('image/')) {
                        toast.error('Please upload an image file');
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setDomainEditModal((prev) => ({ ...prev, logo_url: String(reader.result || '') }));
                      };
                      reader.readAsDataURL(file);
                    }}
                    className="w-full p-2 border rounded-lg bg-slate-50 text-sm"
                  />
                  {domainEditModal.logo_url && (
                    <img
                      src={domainEditModal.logo_url}
                      alt="domain logo preview"
                      className="w-10 h-10 rounded object-cover border border-slate-200"
                    />
                  )}
                </div>
              )}
            </div>
            <div className="p-4 border-t bg-slate-50 flex justify-end gap-2">
              <button
                onClick={closeDomainEditModal}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveDomainEdit}
                className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DOCUMENTATION EDIT MODAL --- */}
      {docModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[1000] p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex items-center justify-between bg-emerald-600 text-white rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <FileText size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm uppercase tracking-wider">{docModal.id ? 'Edit Document' : 'Add New Document'}</h3>
                  <p className="text-[10px] text-emerald-100 uppercase tracking-widest">Configure global document requirements</p>
                </div>
              </div>
              <button onClick={() => setDocModal(prev => ({ ...prev, isOpen: false }))} className="hover:bg-white/10 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Document Name</label>
                  <input
                    className="w-full p-3 border rounded-xl bg-slate-50 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    placeholder="e.g. SSLC Marksheet"
                    value={docModal.document_name}
                    onChange={e => setDocModal({ ...docModal, document_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Requirement Type</label>
                  <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={docModal.is_mandatory}
                        onChange={e => setDocModal({ ...docModal, is_mandatory: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-slate-600 group-hover:text-emerald-600 transition-colors">Mark as Mandatory</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Required For Domains</label>
                  <MultiDomainDropdown
                    domains={data}
                    value={docModal.access_configs.map(c => data.find(d => Number(d.id) === Number(c.domain_id))?.name).filter(Boolean).join(", ")}
                    onChange={(val) => {
                      const names = val.split(",").map(s => s.trim()).filter(Boolean);
                      const configs = names.map(name => ({ domain_id: data.find(d => d.name === name)?.id }));
                      setDocModal(prev => ({ ...prev, access_configs: configs }));
                    }}
                  />
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide ml-1 italic">Select one or more domains where this document is required.</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t flex justify-end gap-3">
              <button
                onClick={() => setDocModal(prev => ({ ...prev, isOpen: false }))}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveDocument}
                className="px-8 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200 transition-all hover:scale-105"
              >
                Save Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterManagement;
