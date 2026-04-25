import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Tabs,
  TabsContent,
} from "../components/ui/tabs";
import {
  CheckSquare,
  PlusCircle,
  MessageSquare,
  Filter,
  Grid3x3,
  List,
  Search,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  Flag,
  Archive,
  TrendingUp,
  Users,
} from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "in-progress" | "flagged" | "completed" | "approved" | "invoiced" | "paid" | "archived";
  category: "operations" | "service" | "training" | "maintenance";
  assignedTo: string;
  dueDate: string;
  createdAt: string;
  estimatedTime: string;
  assignmentType: "internal" | "external";
  checklist: string[];
}

interface Message {
  id: string;
  taskId: string;
  author: string;
  content: string;
  timestamp: string;
  attachments?: string[];
}

const TasksPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL path
  const getTabFromPath = () => {
    if (location.pathname.includes("/tasks/list")) return "todo-list";
    if (location.pathname.includes("/tasks/chat")) return "live-chat";
    return "new-task";
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "",
    category: "",
    assignmentType: "",
    assignee: "",
    dueDate: "",
    estimatedTime: "",
    paymentTerms: "",
  });

  // Sync URL with tab changes
  useEffect(() => {
    const newTab = getTabFromPath();
    setActiveTab(newTab);
  }, [location.pathname]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "new-task") navigate("/tasks/new");
    else if (tab === "todo-list") navigate("/tasks/list");
    else if (tab === "live-chat") navigate("/tasks/chat");
  };

  // Mock tasks data
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "TASK-001",
      title: "Fix HVAC System in Guest Wing A",
      description: "Air conditioning not working properly in rooms 301-310",
      priority: "urgent",
      status: "in-progress",
      category: "maintenance",
      assignedTo: "John Smith - Maintenance",
      dueDate: "2024-01-16",
      createdAt: "2024-01-15T09:00:00",
      estimatedTime: "3 hours",
      assignmentType: "internal",
      checklist: ["Inspect unit", "Replace filter", "Test system", "Document fix"],
    },
    {
      id: "TASK-002",
      title: "Deep Clean Banquet Hall",
      description: "Post-event cleanup and deep cleaning of main banquet hall",
      priority: "high",
      status: "completed",
      category: "operations",
      assignedTo: "Sarah Johnson - Housekeeping",
      dueDate: "2024-01-15",
      createdAt: "2024-01-14T14:00:00",
      estimatedTime: "4 hours",
      assignmentType: "internal",
      checklist: ["Vacuum", "Polish floors", "Clean fixtures", "Restock supplies"],
    },
  ]);

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "MSG-001",
      taskId: "TASK-001",
      author: "Manager",
      content: "Has the HVAC unit been inspected yet?",
      timestamp: "2024-01-15T10:30:00",
    },
    {
      id: "MSG-002",
      taskId: "TASK-001",
      author: "John Smith",
      content: "Yes, inspection is complete. The compressor needs replacement.",
      timestamp: "2024-01-15T11:00:00",
    },
  ]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in-progress":
        return "bg-blue-50 border-l-4 border-l-blue-500";
      case "flagged":
        return "bg-red-50 border-l-4 border-l-red-500";
      case "completed":
        return "bg-green-50 border-l-4 border-l-green-500";
      case "approved":
        return "bg-purple-50 border-l-4 border-l-purple-500";
      case "invoiced":
        return "bg-indigo-50 border-l-4 border-l-indigo-500";
      case "paid":
        return "bg-emerald-50 border-l-4 border-l-emerald-500";
      case "archived":
        return "bg-gray-50 border-l-4 border-l-gray-500";
      default:
        return "";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "in-progress":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "flagged":
        return <Flag className="h-4 w-4 text-red-600" />;
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-purple-600" />;
      case "invoiced":
        return <TrendingUp className="h-4 w-4 text-indigo-600" />;
      case "paid":
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case "archived":
        return <Archive className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Calculate dashboard stats
  const stats = {
    open: tasks.filter((t) => ["in-progress", "flagged"].includes(t.status)).length,
    urgent: tasks.filter((t) => t.priority === "urgent").length,
    completedToday: tasks.filter(
      (t) =>
        t.status === "completed" &&
        new Date(t.createdAt).toDateString() === new Date().toDateString()
    ).length,
    awaitingChat: messages.filter(
      (m) => {
        const task = tasks.find((t) => t.id === m.taskId);
        return task && ["in-progress", "flagged"].includes(task.status);
      }
    ).length,
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateTask = async () => {
    if (!formData.title || !formData.priority || !formData.category) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newTask: Task = {
        id: `TASK-${String(tasks.length + 1).padStart(3, "0")}`,
        title: formData.title,
        description: formData.description,
        priority: formData.priority as Task["priority"],
        status: "in-progress",
        category: formData.category as Task["category"],
        assignedTo: formData.assignee || "Unassigned",
        dueDate: formData.dueDate,
        createdAt: new Date().toISOString(),
        estimatedTime: formData.estimatedTime || "Not specified",
        assignmentType: (formData.assignmentType || "internal") as "internal" | "external",
        checklist: [],
      };

      setTasks([...tasks, newTask]);

      // Reset form
      setFormData({
        title: "",
        description: "",
        priority: "",
        category: "",
        assignmentType: "",
        assignee: "",
        dueDate: "",
        estimatedTime: "",
        paymentTerms: "",
      });

      alert("Task created successfully!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !selectedTask) return;

    const newMessage: Message = {
      id: `MSG-${Date.now()}`,
      taskId: selectedTask,
      author: "Current User",
      content: chatMessage,
      timestamp: new Date().toISOString(),
    };

    setMessages([...messages, newMessage]);
    setChatMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sheraton-cream to-background">
      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <CheckSquare className="h-8 w-8 text-sheraton-gold mr-2" />
            <Badge className="bg-sheraton-gold text-sheraton-navy px-4 py-2">
              Task Management
            </Badge>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-sheraton-navy mb-4">
            Task Management System
          </h1>
          <p className="text-lg text-muted-foreground">
            Create, assign, and track tasks efficiently
          </p>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500 sheraton-gradient text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90 mb-1">Open Tasks</p>
                  <p className="text-3xl font-bold">{stats.open}</p>
                </div>
                <Clock className="h-10 w-10 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Urgent Tasks</p>
                  <p className="text-3xl font-bold text-red-600">{stats.urgent}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-red-500 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completedToday}</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500 opacity-30" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-sheraton-gold">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Chats</p>
                  <p className="text-3xl font-bold text-sheraton-gold">{stats.awaitingChat}</p>
                </div>
                <MessageSquare className="h-10 w-10 text-sheraton-gold opacity-30" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-1 flex">
            <button
              onClick={() => handleTabChange("new-task")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "new-task"
                  ? "bg-sheraton-gold text-sheraton-navy shadow-sm"
                  : "text-gray-600 hover:text-sheraton-navy"
              }`}
            >
              New Task
            </button>
            <button
              onClick={() => handleTabChange("todo-list")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "todo-list"
                  ? "bg-sheraton-gold text-sheraton-navy shadow-sm"
                  : "text-gray-600 hover:text-sheraton-navy"
              }`}
            >
              To Do List
            </button>
            <button
              onClick={() => handleTabChange("live-chat")}
              className={`px-6 py-3 rounded-md font-medium transition-colors ${
                activeTab === "live-chat"
                  ? "bg-sheraton-gold text-sheraton-navy shadow-sm"
                  : "text-gray-600 hover:text-sheraton-navy"
              }`}
            >
              Live Chat
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">

          {/* New Task Tab */}
          <TabsContent value="new-task" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlusCircle className="h-5 w-5 text-sheraton-gold" />
                  Create New Task
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a task and assign it to internal staff or external vendors
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Form Section */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="task-title">Task Title *</Label>
                      <Input
                        id="task-title"
                        placeholder="e.g., Fix HVAC System"
                        value={formData.title}
                        onChange={(e) => handleFormChange("title", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="task-desc">Description</Label>
                      <Textarea
                        id="task-desc"
                        placeholder="Detailed task description..."
                        rows={4}
                        value={formData.description}
                        onChange={(e) => handleFormChange("description", e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Priority *</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleFormChange("priority", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="urgent">Urgent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleFormChange("category", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="operations">Operations</SelectItem>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="training">Training</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Assignment Type *</Label>
                        <Select value={formData.assignmentType} onValueChange={(value) => handleFormChange("assignmentType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="internal">Internal Staff</SelectItem>
                            <SelectItem value="external">External Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Assign To *</Label>
                        <Select value={formData.assignee} onValueChange={(value) => handleFormChange("assignee", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="John Smith - Maintenance">John Smith - Maintenance</SelectItem>
                            <SelectItem value="Sarah Johnson - Housekeeping">Sarah Johnson - Housekeeping</SelectItem>
                            <SelectItem value="ABC Plumbing - Plumbing">ABC Plumbing - Plumbing</SelectItem>
                            <SelectItem value="XYZ Electric - Electrical">XYZ Electric - Electrical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Due Date *</Label>
                        <Input
                          type="date"
                          value={formData.dueDate}
                          onChange={(e) => handleFormChange("dueDate", e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Estimated Time</Label>
                        <Select value={formData.estimatedTime} onValueChange={(value) => handleFormChange("estimatedTime", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select duration" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="30 min">30 minutes</SelectItem>
                            <SelectItem value="1 hour">1 hour</SelectItem>
                            <SelectItem value="2 hours">2 hours</SelectItem>
                            <SelectItem value="4 hours">4 hours</SelectItem>
                            <SelectItem value="8 hours">8 hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Terms (for external vendors)</Label>
                      <Input
                        placeholder="e.g., 50% upfront, balance upon completion"
                        value={formData.paymentTerms}
                        onChange={(e) => handleFormChange("paymentTerms", e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Attachments</Label>
                      <div className="border-2 border-dashed border-sheraton-gold rounded-lg p-6 text-center hover:bg-sheraton-cream transition-colors">
                        <p className="text-sm text-muted-foreground">
                          Drag and drop files here or click to upload
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={handleCreateTask}
                      disabled={isSubmitting}
                      className="w-full sheraton-gradient text-white hover:opacity-90"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? "Creating Task..." : "Create & Send Task"}
                    </Button>
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-4">
                    <Card className="bg-gradient-to-br from-sheraton-cream to-white border-sheraton-gold border-2">
                      <CardHeader>
                        <CardTitle className="text-base text-sheraton-navy flex items-center gap-2">
                          <Flag className="h-5 w-5 text-sheraton-gold" />
                          Task Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm space-y-4">
                        <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
                          <p className="font-semibold text-sheraton-navy mb-1">
                            Clear Instructions
                          </p>
                          <p className="text-gray-600 text-xs">
                            Provide detailed descriptions with expected outcomes
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
                          <p className="font-semibold text-sheraton-navy mb-1">
                            Realistic Deadlines
                          </p>
                          <p className="text-gray-600 text-xs">
                            Allow adequate time for quality work
                          </p>
                        </div>
                        <div className="p-3 bg-white rounded-lg border-l-4 border-l-sheraton-gold">
                          <p className="font-semibold text-sheraton-navy mb-1">
                            Payment Terms
                          </p>
                          <p className="text-gray-600 text-xs">
                            Be clear about payment schedules for external work
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* To do List Tab */}
          <TabsContent value="todo-list" className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 flex gap-2 w-full md:w-auto">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-200"
                  />
                </div>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="invoiced">Invoiced</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 border-l pl-4">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={viewMode === "grid" ? "sheraton-gradient text-white" : ""}
                  title="Grid view"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={viewMode === "list" ? "sheraton-gradient text-white" : ""}
                  title="List view"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tasks Display */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
                  : "space-y-4"
              }
            >
              {filteredTasks.map((task) => (
                <Card
                  key={task.id}
                  className={`${getStatusColor(task.status)} hover:shadow-lg transition-shadow overflow-hidden`}
                >
                  <CardContent className="p-6">
                    {/* Header with Status and Priority */}
                    <div className="flex items-start justify-between mb-4 pb-4 border-b">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-white rounded-lg flex-shrink-0">
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide">
                            {task.id}
                          </p>
                          <h3 className="font-bold text-sheraton-navy mt-1 line-clamp-2 hover:text-sheraton-gold transition-colors">
                            {task.title}
                          </h3>
                        </div>
                      </div>
                      <Badge className={`${getPriorityColor(task.priority)} font-semibold flex-shrink-0 ml-2`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {task.description}
                    </p>

                    {/* Task Details Grid */}
                    <div className="space-y-3 mb-5 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-medium">ASSIGNED</span>
                        <span className="font-semibold text-gray-900">{task.assignedTo}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-medium">DUE</span>
                        <span className="font-semibold text-gray-900">{task.dueDate}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 text-xs font-medium">ESTIMATE</span>
                        <span className="font-semibold text-gray-900">{task.estimatedTime}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Badge
                        variant="outline"
                        className="bg-white"
                      >
                        {task.status
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedTask(task.id);
                          handleTabChange("live-chat");
                        }}
                        className="ml-auto hover:bg-sheraton-gold hover:text-white"
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Chat
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredTasks.length === 0 && (
              <Card className="col-span-full border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <CheckSquare className="h-16 w-16 text-sheraton-gold opacity-40" />
                  </div>
                  <h3 className="text-xl font-semibold text-sheraton-navy mb-2">No tasks found</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Try adjusting your search or filters, or create a new task to get started
                  </p>
                  <Button
                    onClick={() => handleTabChange("new-task")}
                    className="sheraton-gradient text-white"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Create New Task
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Live Chat Tab */}
          <TabsContent value="live-chat" className="space-y-6">
            {selectedTask ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat Area */}
                <Card className="lg:col-span-2 flex flex-col">
                  <CardHeader className="border-b bg-gradient-to-r from-sheraton-cream to-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-sheraton-gold uppercase tracking-wide mb-1">Task</p>
                        <CardTitle className="text-sheraton-navy">
                          {tasks.find((t) => t.id === selectedTask)?.title}
                        </CardTitle>
                      </div>
                      <Badge className="sheraton-gradient text-white">
                        {tasks.find((t) => t.id === selectedTask)?.priority}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 flex-1 flex flex-col p-6">
                    <div className="bg-white rounded-lg p-4 h-80 overflow-y-auto space-y-4 border border-gray-200">
                      {messages
                        .filter((m) => m.taskId === selectedTask)
                        .length === 0 ? (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p className="text-sm">No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages
                          .filter((m) => m.taskId === selectedTask)
                          .map((message) => (
                            <div key={message.id} className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm text-sheraton-navy">
                                  {message.author}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(message.timestamp).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 bg-sheraton-cream p-3 rounded-lg">
                                {message.content}
                              </p>
                            </div>
                          ))
                      )}
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Input
                        placeholder="Type your message..."
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleSendMessage();
                        }}
                        className="border-gray-200"
                      />
                      <Button
                        onClick={handleSendMessage}
                        className="sheraton-gradient text-white hover:opacity-90"
                        disabled={!chatMessage.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Task Details Sidebar */}
                <Card className="bg-gradient-to-b from-sheraton-cream to-white border-sheraton-gold">
                  <CardHeader>
                    <CardTitle className="text-sheraton-navy">Task Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm">
                    {tasks.find((t) => t.id === selectedTask) && (
                      <>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">ID</p>
                          <p className="font-semibold text-sheraton-navy font-mono">
                            {tasks.find((t) => t.id === selectedTask)?.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Priority</p>
                          <Badge
                            className={`${getPriorityColor(
                              tasks.find((t) => t.id === selectedTask)?.priority || ""
                            )} font-semibold`}
                          >
                            {tasks.find((t) => t.id === selectedTask)?.priority
                              .charAt(0)
                              .toUpperCase() +
                              tasks.find((t) => t.id === selectedTask)?.priority.slice(1)}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Assigned To</p>
                          <p className="font-semibold text-sheraton-navy">
                            {tasks.find((t) => t.id === selectedTask)?.assignedTo}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Due Date</p>
                          <p className="font-semibold text-sheraton-navy">
                            {tasks.find((t) => t.id === selectedTask)?.dueDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Status</p>
                          <Badge variant="outline" className="bg-white">
                            {tasks.find((t) => t.id === selectedTask)?.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </Badge>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-2 border-dashed border-sheraton-gold bg-sheraton-cream">
                <CardContent className="p-12 text-center">
                  <div className="flex justify-center mb-6">
                    <MessageSquare className="h-16 w-16 text-sheraton-gold opacity-40" />
                  </div>
                  <h3 className="text-xl font-semibold text-sheraton-navy mb-2">
                    Select a task to view chat
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Click "Chat" on any task from the Task List tab to start or view conversations
                  </p>
                  <Button
                    onClick={() => handleTabChange("todo-list")}
                    className="sheraton-gradient text-white"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Go to Task List
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TasksPage;
