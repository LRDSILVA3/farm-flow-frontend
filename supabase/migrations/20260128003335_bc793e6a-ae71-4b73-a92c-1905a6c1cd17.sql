-- Rename tables from Portuguese to English
ALTER TABLE public.analises RENAME TO analyses;
ALTER TABLE public.analises_execucao RENAME TO analysis_executions;
ALTER TABLE public.clientes RENAME TO clients;
ALTER TABLE public.colaboradores RENAME TO collaborators;
ALTER TABLE public.equipamentos RENAME TO equipment;
ALTER TABLE public.execucoes RENAME TO executions;
ALTER TABLE public.execucoes_parciais RENAME TO partial_executions;
ALTER TABLE public.fazendas RENAME TO farms;
ALTER TABLE public.grupos_servicos RENAME TO service_groups;
ALTER TABLE public.pedidos RENAME TO orders;
ALTER TABLE public.produtos RENAME TO products;
ALTER TABLE public.servico_variaveis RENAME TO service_variables;
ALTER TABLE public.servicos RENAME TO services;
ALTER TABLE public.talhoes RENAME TO plots;
ALTER TABLE public.variaveis_custo RENAME TO cost_variables;

-- Rename columns in analyses table
ALTER TABLE public.analyses RENAME COLUMN colaborador TO collaborator;
ALTER TABLE public.analyses RENAME COLUMN nome TO name;
ALTER TABLE public.analyses RENAME COLUMN prazo TO deadline;
ALTER TABLE public.analyses RENAME COLUMN tipo TO type;
ALTER TABLE public.analyses RENAME COLUMN valor TO value;

-- Rename columns in analysis_executions table
ALTER TABLE public.analysis_executions RENAME COLUMN cliente_id TO client_id;
ALTER TABLE public.analysis_executions RENAME COLUMN colaborador TO collaborator;
ALTER TABLE public.analysis_executions RENAME COLUMN data_envio TO send_date;
ALTER TABLE public.analysis_executions RENAME COLUMN data_finalizacao TO completion_date;
ALTER TABLE public.analysis_executions RENAME COLUMN data_recebimento TO receipt_date;
ALTER TABLE public.analysis_executions RENAME COLUMN fazenda_id TO farm_id;
ALTER TABLE public.analysis_executions RENAME COLUMN nome_analise TO analysis_name;
ALTER TABLE public.analysis_executions RENAME COLUMN quantidade TO quantity;
ALTER TABLE public.analysis_executions RENAME COLUMN talhao_id TO plot_id;

-- Rename columns in clients table
ALTER TABLE public.clients RENAME COLUMN cep TO zip_code;
ALTER TABLE public.clients RENAME COLUMN cidade TO city;
ALTER TABLE public.clients RENAME COLUMN data_nascimento TO birth_date;
ALTER TABLE public.clients RENAME COLUMN estado TO state;
ALTER TABLE public.clients RENAME COLUMN nome TO name;
ALTER TABLE public.clients RENAME COLUMN telefone TO phone;

-- Rename columns in collaborators table
ALTER TABLE public.collaborators RENAME COLUMN endereco TO address;
ALTER TABLE public.collaborators RENAME COLUMN nome TO name;

-- Rename columns in equipment table
ALTER TABLE public.equipment RENAME COLUMN nome TO name;

-- Rename columns in executions table
ALTER TABLE public.executions RENAME COLUMN cliente_id TO client_id;
ALTER TABLE public.executions RENAME COLUMN data_agendada TO scheduled_date;
ALTER TABLE public.executions RENAME COLUMN equipamento TO equipment_name;
ALTER TABLE public.executions RENAME COLUMN fazenda_id TO farm_id;
ALTER TABLE public.executions RENAME COLUMN pedido_id TO order_id;
ALTER TABLE public.executions RENAME COLUMN servico TO service_name;

-- Rename columns in partial_executions table
ALTER TABLE public.partial_executions RENAME COLUMN area_executada TO executed_area;
ALTER TABLE public.partial_executions RENAME COLUMN data TO date;
ALTER TABLE public.partial_executions RENAME COLUMN equipamento TO equipment_name;
ALTER TABLE public.partial_executions RENAME COLUMN execucao_id TO execution_id;
ALTER TABLE public.partial_executions RENAME COLUMN observacoes TO notes;
ALTER TABLE public.partial_executions RENAME COLUMN operador TO operator;

-- Rename columns in farms table
ALTER TABLE public.farms RENAME COLUMN cidade TO city;
ALTER TABLE public.farms RENAME COLUMN cliente_id TO client_id;
ALTER TABLE public.farms RENAME COLUMN contato TO contact;
ALTER TABLE public.farms RENAME COLUMN estado TO state;
ALTER TABLE public.farms RENAME COLUMN lote TO lot;
ALTER TABLE public.farms RENAME COLUMN matricula TO registration;
ALTER TABLE public.farms RENAME COLUMN nome TO name;
ALTER TABLE public.farms RENAME COLUMN proprietario TO owner;

-- Rename columns in service_groups table
ALTER TABLE public.service_groups RENAME COLUMN descricao TO description;
ALTER TABLE public.service_groups RENAME COLUMN nome TO name;
ALTER TABLE public.service_groups RENAME COLUMN servicos_ids TO services_ids;

-- Rename columns in orders table
ALTER TABLE public.orders RENAME COLUMN cliente_id TO client_id;
ALTER TABLE public.orders RENAME COLUMN fazenda_id TO farm_id;
ALTER TABLE public.orders RENAME COLUMN grupo_servico TO service_group;
ALTER TABLE public.orders RENAME COLUMN pagamento TO payment;
ALTER TABLE public.orders RENAME COLUMN produtos TO products_data;
ALTER TABLE public.orders RENAME COLUMN servico TO service_name;
ALTER TABLE public.orders RENAME COLUMN tipo TO type;
ALTER TABLE public.orders RENAME COLUMN valor TO value;

-- Rename columns in products table
ALTER TABLE public.products RENAME COLUMN nome TO name;
ALTER TABLE public.products RENAME COLUMN valor_un TO unit_value;

-- Rename columns in profiles table
ALTER TABLE public.profiles RENAME COLUMN cargo TO role;
ALTER TABLE public.profiles RENAME COLUMN nome TO name;

-- Rename columns in service_variables table
ALTER TABLE public.service_variables RENAME COLUMN servico_id TO service_id;
ALTER TABLE public.service_variables RENAME COLUMN variavel_id TO variable_id;

-- Rename columns in services table
ALTER TABLE public.services RENAME COLUMN nome TO name;
ALTER TABLE public.services RENAME COLUMN produtos TO products;
ALTER TABLE public.services RENAME COLUMN valor_alqueire TO value_per_alqueire;

-- Rename columns in plots table
ALTER TABLE public.plots RENAME COLUMN cidade TO city;
ALTER TABLE public.plots RENAME COLUMN estado TO state;
ALTER TABLE public.plots RENAME COLUMN fazenda_id TO farm_id;
ALTER TABLE public.plots RENAME COLUMN lote TO lot;
ALTER TABLE public.plots RENAME COLUMN matricula TO registration;
ALTER TABLE public.plots RENAME COLUMN nome TO name;

-- Rename columns in cost_variables table
ALTER TABLE public.cost_variables RENAME COLUMN codigo TO code;
ALTER TABLE public.cost_variables RENAME COLUMN descricao TO description;
ALTER TABLE public.cost_variables RENAME COLUMN nome TO name;
ALTER TABLE public.cost_variables RENAME COLUMN valor TO value;